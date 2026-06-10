from __future__ import annotations

import json
import logging

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import extraction, indexing, inference, prompts, retrieval
from app.ai.inference import InferenceError
from app.ai.schemas import GenerateRequest, GenerationType, ModelOutput
from app.courses import service as course_service
from app.materials import service as material_service
from app.models.user import User
from app.notes import models as note_models

logger = logging.getLogger(__name__)


async def _resolve_materials(
    session: AsyncSession,
    user: User,
    req: GenerateRequest,
) -> list:
    rows = []
    for mid in req.source_material_ids:
        row = await material_service.get_material_row(session, mid)
        if row is None:
            raise PermissionError(f"Material not found: {mid}")
        if not await material_service.can_download(session, user, row):
            raise PermissionError("You do not have access to one or more source materials")
        rows.append(row)

    if req.target_course_id is not None:
        if not await course_service.can_access_course(session, req.target_course_id, user):
            raise PermissionError("No access to target course")
        for row in rows:
            if row.course_id is not None and row.course_id != req.target_course_id:
                raise PermissionError("Material does not belong to the target course")

    return rows


def _combine_extracted_legacy(rows: list) -> str:
    """Fallback when RAG indexing/retrieval is unavailable."""
    chunks: list[str] = []
    for row in rows:
        text = extraction.extract_text(row.storage_path, row.filename)
        if not text.strip():
            continue
        chunks.append(f"--- {row.filename} ---\n{text.strip()}")
    combined = "\n\n".join(chunks)
    if not combined.strip():
        raise ValueError("No readable text could be extracted from the selected files.")
    return combined


async def _build_source_context(
    session: AsyncSession,
    rows: list,
    req: GenerateRequest,
) -> str:
    for row in rows:
        try:
            await indexing.ensure_indexed(session, row)
        except Exception as exc:
            logger.warning("RAG indexing failed for %s: %s", row.id, exc)

    material_ids = [r.id for r in rows]
    filenames = {r.id: r.filename for r in rows}

    try:
        return await retrieval.retrieve_context(session, req, material_ids, filenames)
    except Exception as exc:
        logger.warning("RAG retrieval failed, using legacy extraction: %s", exc)
        return _combine_extracted_legacy(rows)


async def generate_and_save(
    session: AsyncSession,
    user: User,
    req: GenerateRequest,
) -> note_models.Note:
    rows = await _resolve_materials(session, user, req)
    combined = await _build_source_context(session, rows, req)

    extra = " ".join(filter(None, [req.prompt, req.focus])).strip() or None
    system = prompts.build_system_prompt(req.type)
    user_msg = prompts.build_user_prompt(req.type, combined, extra, req.page_range)

    raw = await inference.complete(system, user_msg)
    try:
        parsed = inference.parse_json_response(raw)
        output = ModelOutput.model_validate(parsed)
    except (InferenceError, ValidationError) as first_err:
        repair_system = (
            "Fix the following into valid JSON matching the required schema. "
            "Output JSON only, no markdown fences."
        )
        repair_user = f"Schema type: {req.type.value}\n\nBroken output:\n{raw[:8000]}"
        try:
            raw2 = await inference.complete(repair_system, repair_user)
            parsed = inference.parse_json_response(raw2)
            output = ModelOutput.model_validate(parsed)
        except (InferenceError, ValidationError) as e:
            raise first_err from e

    course_id = req.target_course_id
    if course_id is None and len(rows) == 1 and rows[0].course_id is not None:
        course_id = rows[0].course_id

    material_ids = [str(r.id) for r in rows]
    note = note_models.Note(
        title=output.title[:255] or f"Generated {req.type.value}",
        content=output.body_markdown or output.brief_summary or "Generated content",
        owner_id=user.id,
        kind=req.type.value,
        is_generated=True,
        course_id=course_id,
        source_material_ids=json.dumps(material_ids),
        metadata_json=json.dumps(output.to_metadata()),
    )
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return note

"""Retrieve the most relevant document chunks for generation."""

from __future__ import annotations

import os
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import embeddings
from app.ai.page_range import parse_page_range
from app.ai.schemas import GenerateRequest
from app.rag.models import DocumentChunk

TOP_K = int(os.getenv("RAG_TOP_K", "8"))
MAX_CONTEXT_CHARS = int(os.getenv("RAG_MAX_CONTEXT_CHARS", "12000"))


def build_retrieval_query(req: GenerateRequest) -> str:
    parts = [f"Educational content for generating a {req.type.value}"]
    if req.page_range:
        parts.append(f"focus on pages or slides {req.page_range}")
    if req.focus:
        parts.append(req.focus)
    if req.prompt:
        parts.append(req.prompt)
    return ". ".join(parts)


async def retrieve_context(
    session: AsyncSession,
    req: GenerateRequest,
    material_ids: list[uuid.UUID],
    filenames: dict[uuid.UUID, str],
) -> str:
    query = build_retrieval_query(req)
    query_vector = await embeddings.embed_text(query)

    page_filter = parse_page_range(req.page_range)

    async def _run_query(apply_page_filter: bool) -> list[DocumentChunk]:
        q = (
            select(DocumentChunk)
            .where(DocumentChunk.material_id.in_(material_ids))
            .order_by(DocumentChunk.embedding.cosine_distance(query_vector))
            .limit(TOP_K * 2)
        )
        if apply_page_filter and page_filter is not None:
            q = q.where(DocumentChunk.page_number.in_(page_filter))
        return list((await session.execute(q)).scalars().all())[:TOP_K]

    chunks = await _run_query(True)
    if not chunks and page_filter is not None:
        chunks = await _run_query(False)

    if not chunks:
        raise ValueError("No indexed chunks found for the selected materials. Try re-uploading or re-indexing.")

    sections: list[str] = []
    total = 0
    for chunk in chunks:
        label = filenames.get(chunk.material_id, "document")
        page = f" (page {chunk.page_number})" if chunk.page_number else ""
        block = f"--- {label}{page} ---\n{chunk.content.strip()}"
        if total + len(block) > MAX_CONTEXT_CHARS:
            break
        sections.append(block)
        total += len(block)

    if not sections:
        raise ValueError("Retrieved chunks were empty after filtering.")

    header = (
        f"[RAG: retrieved {len(sections)} relevant section(s) from {len(material_ids)} file(s)]"
    )
    return header + "\n\n" + "\n\n".join(sections)

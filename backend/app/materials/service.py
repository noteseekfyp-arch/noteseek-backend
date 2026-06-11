import os
import re
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import indexing as rag_indexing
from app.courses import service as course_service
from app.materials import models, schemas
from app.models.user import User

UPLOAD_ROOT = Path(os.getenv("NOTESEEK_UPLOAD_DIR", "uploads")).resolve()


def _safe_filename(name: str) -> str:
    base = Path(name).name
    return re.sub(r"[^a-zA-Z0-9._-]", "_", base)[:200] or "file"


def _material_file_url(base_url: str, material_id: uuid.UUID) -> str:
    root = base_url.rstrip("/")
    return f"{root}/api/materials/{material_id}/file"


async def save_upload(
    session: AsyncSession,
    user: User,
    file: UploadFile,
    course_id: uuid.UUID | None,
    base_url: str,
) -> schemas.MaterialRead:
    if course_id is not None:
        if user.role not in ("teacher", "admin"):
            raise PermissionError("Only teachers can upload course materials")
        if not await course_service.teacher_owns_course(session, course_id, user.id):
            raise PermissionError("You do not own this course")
    else:
        if user.role not in ("student", "teacher", "admin"):
            raise PermissionError("Not allowed")

    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

    mid = uuid.uuid4()
    safe = _safe_filename(file.filename or "upload")
    disk_name = f"{mid}_{safe}"
    dest = UPLOAD_ROOT / disk_name

    content = await file.read()
    dest.write_bytes(content)

    row = models.Material(
        id=mid,
        filename=file.filename or safe,
        storage_path=str(dest),
        course_id=course_id,
        owner_id=user.id,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)

    material_read = schemas.MaterialRead(
        id=row.id,
        filename=row.filename,
        url=_material_file_url(base_url, row.id),
        course_id=row.course_id,
        uploaded_at=row.uploaded_at,
        index_status=row.index_status,
    )

    try:
        await rag_indexing.index_material(session, row)
        await session.refresh(row)
        material_read.index_status = row.index_status
    except Exception:
        await session.refresh(row)
        material_read.index_status = row.index_status

    return material_read


async def list_for_user(
    session: AsyncSession,
    user: User,
    course_id: uuid.UUID | None,
    base_url: str,
) -> list[schemas.MaterialRead]:
    if course_id is None:
        r = await session.execute(
            select(models.Material)
            .where(
                models.Material.owner_id == user.id,
                models.Material.course_id.is_(None),
            )
            .order_by(desc(models.Material.uploaded_at))
        )
    else:
        if not await course_service.can_access_course(session, course_id, user):
            raise PermissionError("No access to this course")
        r = await session.execute(
            select(models.Material)
            .where(models.Material.course_id == course_id)
            .order_by(desc(models.Material.uploaded_at))
        )
    rows = r.scalars().all()
    return [
        schemas.MaterialRead(
            id=m.id,
            filename=m.filename,
            url=_material_file_url(base_url, m.id),
            course_id=m.course_id,
            uploaded_at=m.uploaded_at,
            index_status=m.index_status,
        )
        for m in rows
    ]


async def get_material_row(session: AsyncSession, material_id: uuid.UUID) -> models.Material | None:
    r = await session.execute(select(models.Material).where(models.Material.id == material_id))
    return r.scalar_one_or_none()


async def reindex_material(
    session: AsyncSession,
    user: User,
    material_id: uuid.UUID,
    base_url: str,
) -> schemas.MaterialRead:
    row = await get_material_row(session, material_id)
    if row is None:
        raise LookupError("Material not found")
    if not await can_download(session, user, row):
        raise PermissionError("Not allowed")
    await rag_indexing.index_material(session, row)
    await session.refresh(row)
    return schemas.MaterialRead(
        id=row.id,
        filename=row.filename,
        url=_material_file_url(base_url, row.id),
        course_id=row.course_id,
        uploaded_at=row.uploaded_at,
        index_status=row.index_status,
    )


async def delete_material(session: AsyncSession, user: User, material_id: uuid.UUID) -> None:
    row = await get_material_row(session, material_id)
    if row is None:
        raise LookupError("Material not found")
    if row.owner_id != user.id and user.role != "admin":
        raise PermissionError("Only the uploader can delete this material")

    storage_path = Path(row.storage_path)
    # document_chunks rows are removed by the DB (ON DELETE CASCADE)
    await session.delete(row)
    await session.commit()

    try:
        storage_path.unlink(missing_ok=True)
    except OSError:
        pass  # DB row is gone; an orphaned file on disk is not fatal


async def can_download(session: AsyncSession, user: User, row: models.Material) -> bool:
    if row.owner_id == user.id:
        return True
    if row.course_id is None:
        return False
    return await course_service.can_access_course(session, row.course_id, user)

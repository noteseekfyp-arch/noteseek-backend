from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_role
from app.db.session import get_async_session
from app.materials import schemas, service
from app.models.user import User

router = APIRouter(prefix="/materials", tags=["materials"])


def _base_url(request: Request) -> str:
    return str(request.base_url).rstrip("/")


@router.post("/upload", response_model=schemas.MaterialRead)
async def upload_material(
    request: Request,
    file: UploadFile = File(...),
    course_id: str | None = Form(default=None),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    cid: UUID | None = None
    if course_id and course_id.strip():
        try:
            cid = UUID(course_id.strip())
        except ValueError as e:
            raise HTTPException(status_code=400, detail="Invalid course_id") from e
    try:
        return await service.save_upload(session, user, file, cid, _base_url(request))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e


@router.get("", response_model=list[schemas.MaterialRead])
async def list_materials(
    request: Request,
    course_id: UUID | None = None,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    try:
        return await service.list_for_user(session, user, course_id, _base_url(request))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e


@router.get("/{material_id}/file", name="download_material_file")
async def download_material_file(
    material_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    row = await service.get_material_row(session, material_id)
    if not row:
        raise HTTPException(status_code=404, detail="Material not found")
    if not await service.can_download(session, user, row):
        raise HTTPException(status_code=403, detail="Not allowed")
    p = Path(row.storage_path)
    if not p.is_file():
        raise HTTPException(status_code=404, detail="File missing on server")
    return FileResponse(p, filename=row.filename, media_type="application/octet-stream")

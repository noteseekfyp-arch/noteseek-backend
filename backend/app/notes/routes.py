from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import select

from app.db.session import get_async_session
from app.models.user import User
from app.core.dependencies import require_role
from app.notes import service, schemas, models


router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/", response_model=schemas.NoteRead)
async def create_note(
    data: schemas.NoteCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    return await service.create_note(session, user.id, data)


@router.get("/", response_model=list[schemas.NoteRead])
async def my_notes(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    return await service.get_user_notes(session, user.id)


@router.put("/{note_id}", response_model=schemas.NoteRead)
async def update_note(
    note_id: UUID,
    data: schemas.NoteUpdate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    result = await session.execute(
        select(models.Note).where(
            models.Note.id == note_id,
            models.Note.owner_id == user.id,
        )
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return await service.update_note(session, note, data)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    result = await session.execute(
        select(models.Note).where(
            models.Note.id == note_id,
            models.Note.owner_id == user.id,
        )
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    await service.delete_note(session, note)


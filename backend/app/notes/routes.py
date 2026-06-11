from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import desc, select

from app.courses import service as course_service
from app.db.session import get_async_session
from app.models.user import User
from app.core.dependencies import require_role
from app.notes import pdf, service, schemas, models
from app.notes.schemas import note_to_read


router = APIRouter(prefix="/notes", tags=["notes"])


async def _get_accessible_note(
    session: AsyncSession, user: User, note_id: UUID
) -> models.Note:
    """Owner always has access; others only if the note is published to a course they can access."""
    result = await session.execute(select(models.Note).where(models.Note.id == note_id))
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.owner_id == user.id:
        return note
    if (
        note.is_published
        and note.course_id is not None
        and await course_service.can_access_course(session, note.course_id, user)
    ):
        return note
    raise HTTPException(status_code=404, detail="Note not found")


@router.post("", response_model=schemas.NoteRead)
async def create_note(
    data: schemas.NoteCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    note = await service.create_note(session, user.id, data)
    return note_to_read(note)


@router.get("", response_model=list[schemas.NoteRead])
async def my_notes(
    generated_only: bool | None = Query(None),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    return await service.get_user_notes(session, user.id, generated_only=generated_only)


@router.get("/published", response_model=list[schemas.NoteRead])
async def published_notes(
    course_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    if not await course_service.can_access_course(session, course_id, user):
        raise HTTPException(status_code=403, detail="No access to this course")
    result = await session.execute(
        select(models.Note)
        .where(models.Note.course_id == course_id, models.Note.is_published.is_(True))
        .order_by(desc(models.Note.created_at))
    )
    return [note_to_read(n) for n in result.scalars().all()]


@router.get("/{note_id}", response_model=schemas.NoteRead)
async def get_note(
    note_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    note = await _get_accessible_note(session, user, note_id)
    return note_to_read(note)


@router.patch("/{note_id}/publish", response_model=schemas.NoteRead)
async def publish_note(
    note_id: UUID,
    published: bool = Query(True),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("teacher", "admin")),
):
    result = await session.execute(
        select(models.Note).where(models.Note.id == note_id, models.Note.owner_id == user.id)
    )
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.course_id is None:
        raise HTTPException(status_code=400, detail="Note is not linked to a course")
    note.is_published = published
    await session.commit()
    await session.refresh(note)
    return note_to_read(note)


@router.get("/{note_id}/pdf")
async def download_note_pdf(
    note_id: UUID,
    answers: bool = Query(True, description="Include correct answers/explanations (quiz)"),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    row = await _get_accessible_note(session, user, note_id)
    note = note_to_read(row)
    # Students never get the answer key for published quizzes
    if row.owner_id != user.id:
        answers = False
    pdf_bytes = pdf.build_note_pdf(note, include_answers=answers)
    filename = pdf.pdf_filename(note.title)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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

    updated = await service.update_note(session, note, data)
    return note_to_read(updated)


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


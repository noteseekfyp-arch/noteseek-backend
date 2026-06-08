from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select
from uuid import UUID

from app.notes.models import Note
from app.notes.schemas import NoteCreate, NoteUpdate, note_to_read


async def create_note(
    session: AsyncSession,
    user_id: UUID,
    data: NoteCreate,
):
    note = Note(
        title=data.title,
        content=data.content,
        owner_id=user_id,
    )
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return note


async def get_user_notes(
    session: AsyncSession,
    user_id: UUID,
    generated_only: bool | None = None,
):
    q = select(Note).where(Note.owner_id == user_id)
    if generated_only is True:
        q = q.where(Note.is_generated.is_(True))
    elif generated_only is False:
        q = q.where(Note.is_generated.is_(False))
    result = await session.execute(q.order_by(desc(Note.created_at)))
    return [note_to_read(n) for n in result.scalars().all()]


async def get_note_for_user(
    session: AsyncSession,
    user_id: UUID,
    note_id: UUID,
):
    result = await session.execute(
        select(Note).where(Note.id == note_id, Note.owner_id == user_id)
    )
    note = result.scalar_one_or_none()
    if note is None:
        return None
    return note_to_read(note)


async def update_note(
    session: AsyncSession,
    note: Note,
    data: NoteUpdate,
):
    if data.title is not None:
        note.title = data.title
    if data.content is not None:
        note.content = data.content

    await session.commit()
    await session.refresh(note)
    return note


async def delete_note(
    session: AsyncSession,
    note: Note,
):
    await session.delete(note)
    await session.commit()


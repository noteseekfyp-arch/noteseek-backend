from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.notes.models import Note
from app.notes.schemas import NoteCreate, NoteUpdate


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
):
    result = await session.execute(
        select(Note).where(Note.owner_id == user_id)
    )
    return result.scalars().all()


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


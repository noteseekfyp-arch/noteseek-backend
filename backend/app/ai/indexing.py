"""Index uploaded materials into pgvector document_chunks."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import chunking, embeddings, extraction
from app.materials import models as material_models
from app.rag.models import DocumentChunk


async def chunk_count(session: AsyncSession, material_id: uuid.UUID) -> int:
    r = await session.execute(
        select(func.count()).select_from(DocumentChunk).where(DocumentChunk.material_id == material_id)
    )
    return int(r.scalar() or 0)


async def index_material(session: AsyncSession, material: material_models.Material) -> int:
    """Extract, chunk, embed, and store vectors for one material. Returns chunk count."""
    material.index_status = "indexing"
    await session.commit()

    try:
        pages = extraction.extract_pages(material.storage_path, material.filename)
        if not pages:
            raise ValueError("No readable text could be extracted from this file.")

        drafts = chunking.split_pages_into_chunks(pages)
        if not drafts:
            raise ValueError("No chunks produced from extracted text.")

        await session.execute(
            delete(DocumentChunk).where(DocumentChunk.material_id == material.id)
        )

        texts = [d.content for d in drafts]
        vectors = await embeddings.embed_texts(texts)

        for draft, vector in zip(drafts, vectors, strict=True):
            session.add(
                DocumentChunk(
                    material_id=material.id,
                    owner_id=material.owner_id,
                    chunk_index=draft.chunk_index,
                    page_number=draft.page_number,
                    content=draft.content,
                    embedding=vector,
                )
            )

        material.index_status = "ready"
        await session.commit()
        return len(drafts)
    except Exception:
        material.index_status = "failed"
        await session.commit()
        raise


async def ensure_indexed(session: AsyncSession, material: material_models.Material) -> None:
    """Index on demand if chunks are missing (e.g. materials uploaded before RAG)."""
    count = await chunk_count(session, material.id)
    if count == 0 or material.index_status in ("pending", "failed"):
        await index_material(session, material)

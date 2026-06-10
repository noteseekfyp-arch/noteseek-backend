"""Split extracted pages into RAG-sized chunks."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

from app.ai.extraction import PageText

CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "900"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "120"))


@dataclass(frozen=True)
class ChunkDraft:
    content: str
    page_number: int | None
    chunk_index: int


def split_pages_into_chunks(pages: list[PageText]) -> list[ChunkDraft]:
    drafts: list[ChunkDraft] = []
    idx = 0
    for page in pages:
        text = page.text.strip()
        if not text:
            continue
        for piece in _split_text(text, CHUNK_SIZE, CHUNK_OVERLAP):
            drafts.append(ChunkDraft(content=piece, page_number=page.page_number, chunk_index=idx))
            idx += 1
    return drafts


def _split_text(text: str, size: int, overlap: int) -> list[str]:
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if len(text) <= size:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        if end < len(text):
            # Prefer breaking at paragraph or sentence boundary
            break_at = text.rfind("\n\n", start, end)
            if break_at <= start + size // 3:
                break_at = text.rfind(". ", start, end)
            if break_at > start + size // 3:
                end = break_at + (2 if text[break_at : break_at + 2] == ". " else 1)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks

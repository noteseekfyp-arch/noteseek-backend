"""Extract plain text from uploaded course materials."""

from __future__ import annotations

from pathlib import Path


def extract_text(path: str | Path, filename: str | None = None) -> str:
    p = Path(path)
    if not p.is_file():
        raise FileNotFoundError(f"Material file not found: {p}")

    name = (filename or p.name).lower()
    if name.endswith(".pdf"):
        return _extract_pdf(p)
    if name.endswith(".pptx"):
        return _extract_pptx(p)
    if name.endswith(".txt") or name.endswith(".md"):
        return p.read_text(encoding="utf-8", errors="replace")
    raise ValueError(f"Unsupported file type for text extraction: {name}")


def _extract_pdf(path: Path) -> str:
    import fitz  # PyMuPDF

    doc = fitz.open(path)
    parts: list[str] = []
    try:
        for page in doc:
            text = page.get_text().strip()
            if text:
                parts.append(text)
    finally:
        doc.close()
    return "\n\n".join(parts)


def _extract_pptx(path: Path) -> str:
    from pptx import Presentation

    prs = Presentation(str(path))
    parts: list[str] = []
    for slide in prs.slides:
        slide_bits: list[str] = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text:
                slide_bits.append(shape.text.strip())
        if slide_bits:
            parts.append("\n".join(slide_bits))
    return "\n\n".join(parts)

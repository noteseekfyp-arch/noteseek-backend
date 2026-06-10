"""Build rag_lecture_notes.pdf from rag_lecture_notes.txt — one page per 'PAGE N' section."""

from pathlib import Path

import fitz  # PyMuPDF

here = Path(__file__).parent
text = (here / "rag_lecture_notes.txt").read_text(encoding="utf-8")

# Split on "PAGE N — " markers; keep the title block on page 1
sections = []
current: list[str] = []
for line in text.splitlines():
    if line.startswith("PAGE ") and current:
        sections.append("\n".join(current).strip())
        current = [line]
    else:
        current.append(line)
sections.append("\n".join(current).strip())

doc = fitz.open()
for body in sections:
    page = doc.new_page(width=595, height=842)  # A4
    rect = fitz.Rect(50, 50, 545, 792)
    page.insert_textbox(rect, body, fontsize=10.5, fontname="helv", lineheight=1.4)

out = here / "rag_lecture_notes.pdf"
doc.save(out)
print(f"Saved {out} with {doc.page_count} pages")

"""Render a generated note as a downloadable PDF (PyMuPDF, no extra deps)."""

from __future__ import annotations

import re
from typing import Any

import fitz  # PyMuPDF

from app.notes.schemas import NoteRead

PAGE_W, PAGE_H = 595, 842  # A4 portrait
MARGIN = 56
MAX_W = PAGE_W - 2 * MARGIN
BOTTOM = PAGE_H - MARGIN

BODY = ("helv", 10.5, 1.45)
H1 = ("hebo", 17, 1.3)
H2 = ("hebo", 13.5, 1.35)
H3 = ("hebo", 11.5, 1.35)
SMALL = ("helv", 9, 1.4)


def _clean(line: str) -> str:
    # Strip markdown emphasis markers; keep the text
    line = re.sub(r"\*\*(.+?)\*\*", r"\1", line)
    line = re.sub(r"\*(.+?)\*", r"\1", line)
    return line.replace("`", "")


def _wrap(text: str, fontname: str, fontsize: float, max_width: float) -> list[str]:
    words = text.split()
    if not words:
        return [""]
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if fitz.get_text_length(candidate, fontname=fontname, fontsize=fontsize) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


class _Writer:
    def __init__(self) -> None:
        self.doc = fitz.open()
        self.page = None
        self.y = MARGIN

    def _new_page(self) -> None:
        self.page = self.doc.new_page(width=PAGE_W, height=PAGE_H)
        self.y = MARGIN

    def spacer(self, h: float) -> None:
        self.y += h

    def text(self, content: str, style: tuple[str, float, float], indent: float = 0) -> None:
        fontname, size, leading = style
        line_h = size * leading
        for raw_line in content.split("\n"):
            for line in _wrap(_clean(raw_line), fontname, size, MAX_W - indent):
                if self.page is None or self.y + line_h > BOTTOM:
                    self._new_page()
                self.page.insert_text(
                    (MARGIN + indent, self.y + size),
                    line,
                    fontname=fontname,
                    fontsize=size,
                    color=(0.1, 0.1, 0.15),
                )
                self.y += line_h

    def rule(self) -> None:
        if self.page is None or self.y + 10 > BOTTOM:
            self._new_page()
        self.page.draw_line(
            fitz.Point(MARGIN, self.y + 4),
            fitz.Point(PAGE_W - MARGIN, self.y + 4),
            color=(0.75, 0.75, 0.8),
            width=0.7,
        )
        self.y += 12

    def markdownish(self, body: str) -> None:
        for line in body.split("\n"):
            stripped = line.strip()
            if not stripped:
                self.spacer(5)
            elif stripped.startswith("### "):
                self.spacer(6)
                self.text(stripped[4:], H3)
            elif stripped.startswith("## "):
                self.spacer(9)
                self.text(stripped[3:], H2)
            elif stripped.startswith("# "):
                self.spacer(9)
                self.text(stripped[2:], H2)
            elif stripped.startswith(("- ", "* ")):
                self.text(f"\u2022  {stripped[2:]}", BODY, indent=10)
            else:
                self.text(stripped, BODY)

    def bytes(self) -> bytes:
        if self.page is None:
            self._new_page()
        return self.doc.tobytes()


def build_note_pdf(note: NoteRead, include_answers: bool = True) -> bytes:
    w = _Writer()
    meta: dict[str, Any] = note.metadata or {}
    is_assignment = note.kind == "assignment"
    is_quiz = note.kind == "quiz"

    kind = (note.kind or "note").replace("_", " ").title()
    created = note.created_at.strftime("%B %d, %Y") if note.created_at else ""

    w.text(note.title, H1)
    w.spacer(2)
    subtitle = f"{kind}  ·  Generated with NoteSeek  ·  {created}"
    if is_quiz and not include_answers:
        subtitle = f"{kind} (Student Copy)  ·  {created}    Name: ____________________"
    w.text(subtitle, SMALL)
    w.rule()

    # For assignments/quizzes, skip the study-notes style summary/key points so
    # the handout looks like a real assessment document.
    summary = meta.get("brief_summary")
    if summary and not (is_assignment or is_quiz):
        w.spacer(4)
        w.text("Summary", H2)
        w.spacer(2)
        w.text(str(summary), BODY)

    if note.content and note.content.strip():
        w.spacer(8)
        w.markdownish(note.content)

    sections = meta.get("assignment_sections") or []
    if sections:
        w.spacer(10)
        w.text("Tasks", H2)
        for section in sections:
            heading = section.get("heading") or section.get("title") or "Task"
            content = section.get("content") or section.get("description") or ""
            w.spacer(6)
            w.text(str(heading), H3)
            if content:
                w.text(str(content), BODY, indent=4)

    key_points = meta.get("key_points") or []
    if key_points and not (is_assignment or is_quiz):
        w.spacer(10)
        w.text("Key Points", H2)
        w.spacer(2)
        for i, point in enumerate(key_points, 1):
            w.text(f"{i}.  {point}", BODY, indent=4)

    flashcards = meta.get("flashcards") or []
    if flashcards:
        w.spacer(10)
        w.text("Flashcards", H2)
        for i, card in enumerate(flashcards, 1):
            w.spacer(5)
            w.text(f"Card {i}", H3)
            w.text(f"Q: {card.get('front', '')}", BODY, indent=6)
            w.text(f"A: {card.get('back', '')}", BODY, indent=6)

    quiz = meta.get("quiz_questions") or []
    if quiz:
        w.spacer(10)
        w.text("Quiz" if include_answers else "Questions", H2)
        for i, q in enumerate(quiz, 1):
            w.spacer(5)
            w.text(f"Q{i}. {q.get('question', '')}", H3)
            options = q.get("options") or []
            correct = q.get("correct_index", -1)
            for j, opt in enumerate(options):
                letter = chr(65 + j)
                suffix = "   (correct)" if include_answers and j == correct else ""
                marker = f"{letter}." if include_answers else f"[  ] {letter}."
                w.text(f"{marker}  {opt}{suffix}", BODY, indent=10)
            if include_answers and q.get("explanation"):
                w.text(f"Explanation: {q['explanation']}", SMALL, indent=10)

        if include_answers and is_quiz:
            w.spacer(12)
            w.text("Answer Key", H2)
            answers = []
            for i, q in enumerate(quiz, 1):
                idx = q.get("correct_index", -1)
                letter = chr(65 + idx) if isinstance(idx, int) and 0 <= idx < 26 else "?"
                answers.append(f"Q{i}: {letter}")
            w.text("    ".join(answers), BODY)

    return w.bytes()


def pdf_filename(title: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9 _-]", "", title).strip().replace(" ", "_")[:80]
    return f"{safe or 'noteseek_note'}.pdf"

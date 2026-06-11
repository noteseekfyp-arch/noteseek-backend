"""Prompt templates tuned for small local models (e.g. gemma3:4b)."""

from __future__ import annotations

import os

from app.ai.schemas import GenerationType

MAX_SOURCE_CHARS = int(os.getenv("OLLAMA_MAX_SOURCE_CHARS", "12000"))


def _schema_for(gen_type: GenerationType) -> str:
    if gen_type == GenerationType.flashcards:
        return """Return ONLY one JSON object (no markdown):
{"title":"Deck title","body_markdown":"short intro","brief_summary":"","key_points":[],"flashcards":[{"front":"question","back":"answer"}],"quiz_questions":[],"assignment_sections":[]}
Create exactly 6 flashcards from the source. Use empty strings/arrays for unused fields."""
    if gen_type == GenerationType.quiz:
        return """Return ONLY one JSON object (no markdown):
{"title":"Quiz title","body_markdown":"quiz instructions","brief_summary":"","key_points":[],"flashcards":[],"quiz_questions":[{"question":"text","options":["A","B","C","D"],"correct_index":0,"explanation":"why"}],"assignment_sections":[]}
Create exactly 5 multiple-choice questions. correct_index is 0-3. Use empty strings/arrays for unused fields."""
    if gen_type == GenerationType.summary:
        return """Return ONLY one JSON object (no markdown):
{"title":"Notes title","body_markdown":"## Section\\nDetailed notes in markdown","brief_summary":"2-3 sentences","key_points":["point 1","point 2","point 3"],"flashcards":[],"quiz_questions":[],"assignment_sections":[]}
Write clear study notes in body_markdown. Use empty arrays for unused fields."""
    if gen_type == GenerationType.study_guide:
        return """Return ONLY one JSON object (no markdown):
{"title":"Study guide title","body_markdown":"## Topics\\nStructured guide with headings","brief_summary":"overview","key_points":["key idea"],"flashcards":[],"quiz_questions":[],"assignment_sections":[]}
Use empty arrays for unused fields."""
    if gen_type == GenerationType.assignment:
        return """Return ONLY one JSON object (no markdown):
{"title":"Assignment title","body_markdown":"## Instructions\\nWhat students must do, deadline expectations, and submission format","brief_summary":"one sentence on what the assignment assesses","key_points":[],"flashcards":[],"quiz_questions":[],"assignment_sections":[{"heading":"Task 1: name (20 marks)","content":"Full task description: what to do, what to deliver, and how it will be graded"}]}
You are writing a real assignment a teacher will hand to students — NOT study notes.
Rules:
- body_markdown: only instructions and submission guidelines. Do NOT summarize the source material in it.
- assignment_sections: 3-5 graded tasks. Each MUST be an object with "heading" and "content" strings — never a plain string. Include marks in each heading and make tasks require applying the source material (design, explain, compare, implement).
- flashcards and quiz_questions MUST be empty arrays.
- key_points MUST be an empty array."""
    return """Return ONLY one JSON object with title, body_markdown, brief_summary, key_points, flashcards, quiz_questions, assignment_sections."""


def build_system_prompt(gen_type: GenerationType) -> str:
    return (
        "You are an educational assistant. Use ONLY facts from the source text. "
        "Do not invent information. Respond with valid JSON only — no code fences, no extra text.\n"
        f"{_schema_for(gen_type)}"
    )


def build_user_prompt(
    gen_type: GenerationType,
    combined_text: str,
    extra_instructions: str | None,
    page_range: str | None,
) -> str:
    # Context is already sized by RAG retrieval; apply a safety cap only.
    source = combined_text[:MAX_SOURCE_CHARS]
    if len(combined_text) > MAX_SOURCE_CHARS:
        source += "\n\n[Context truncated to fit model limits.]"

    parts = [f"Task: generate {gen_type.value}", ""]
    if page_range:
        parts.append(f"Page/slide focus (already filtered when possible): {page_range}")
    if extra_instructions:
        parts.append(f"Instructions: {extra_instructions}")
    parts.append("Use ONLY the retrieved source excerpts below.")
    parts.extend(["", "SOURCE:", source])
    return "\n".join(parts)

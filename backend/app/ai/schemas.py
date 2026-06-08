from __future__ import annotations

from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator


class GenerationType(str, Enum):
    summary = "summary"
    flashcards = "flashcards"
    quiz = "quiz"
    assignment = "assignment"
    study_guide = "study_guide"


class GenerateRequest(BaseModel):
    type: GenerationType
    source_material_ids: list[UUID] = Field(min_length=1)
    prompt: str | None = None
    target_course_id: UUID | None = None
    page_range: str | None = None
    focus: str | None = None

    @field_validator("source_material_ids")
    @classmethod
    def unique_ids(cls, v: list[UUID]) -> list[UUID]:
        if len(v) != len(set(v)):
            raise ValueError("source_material_ids must be unique")
        return v


class GenerateResponse(BaseModel):
    id: UUID
    title: str
    type: GenerationType
    content: str


class ModelOutput(BaseModel):
    title: str = "Generated content"
    body_markdown: str = ""
    brief_summary: str = ""
    key_points: list[str] = Field(default_factory=list)
    flashcards: list[dict[str, str]] = Field(default_factory=list)
    quiz_questions: list[dict[str, Any]] = Field(default_factory=list)
    assignment_sections: list[dict[str, str]] = Field(default_factory=list)

    @field_validator("title", "body_markdown", "brief_summary", mode="before")
    @classmethod
    def coerce_str(cls, v: Any) -> str:
        if v is None:
            return ""
        return str(v)

    @model_validator(mode="after")
    def fill_body_from_structured(self) -> ModelOutput:
        if self.body_markdown.strip():
            return self

        if self.flashcards:
            lines = ["# Flashcards", ""]
            for i, card in enumerate(self.flashcards, 1):
                front = card.get("front", "")
                back = card.get("back", "")
                lines.append(f"## Card {i}")
                lines.append(f"**Q:** {front}")
                lines.append(f"**A:** {back}")
                lines.append("")
            self.body_markdown = "\n".join(lines)
        elif self.quiz_questions:
            lines = ["# Quiz", ""]
            for i, q in enumerate(self.quiz_questions, 1):
                question = q.get("question", "")
                options = q.get("options") or []
                idx = q.get("correct_index", 0)
                lines.append(f"## Question {i}")
                lines.append(question)
                for j, opt in enumerate(options):
                    mark = " (correct)" if j == idx else ""
                    lines.append(f"- {opt}{mark}")
                expl = q.get("explanation")
                if expl:
                    lines.append(f"\n*Explanation:* {expl}")
                lines.append("")
            self.body_markdown = "\n".join(lines)

        if not self.body_markdown.strip() and self.brief_summary:
            self.body_markdown = self.brief_summary

        return self

    def to_metadata(self) -> dict[str, Any]:
        return {
            "brief_summary": self.brief_summary,
            "key_points": self.key_points,
            "flashcards": self.flashcards,
            "quiz_questions": self.quiz_questions,
            "assignment_sections": self.assignment_sections,
        }

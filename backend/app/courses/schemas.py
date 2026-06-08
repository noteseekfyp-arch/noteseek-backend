import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    university: str = Field(..., min_length=1, max_length=255)
    department: str = Field(..., min_length=1, max_length=255)
    semester: str = ""
    visibility: str = "public"


class CourseRead(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    university: str
    department: str
    semester: str
    visibility: str
    teacher_id: uuid.UUID
    teacher: str
    student_count: int = 0
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}

import uuid
from datetime import datetime

from pydantic import BaseModel


class MaterialRead(BaseModel):
    id: uuid.UUID
    filename: str
    url: str
    course_id: uuid.UUID | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}

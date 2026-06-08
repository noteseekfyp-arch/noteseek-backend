import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(512), nullable=False)
    storage_path = Column(String(1024), nullable=False)

    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

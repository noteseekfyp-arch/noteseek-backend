from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Column, String
from app.db.base import Base

class User(SQLAlchemyBaseUserTableUUID, Base):
    role = Column(String, nullable=False, default="student")
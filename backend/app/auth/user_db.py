from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi import Depends
from app.models.user import User
from app.db.session import get_async_session

async def get_user_db(session=Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
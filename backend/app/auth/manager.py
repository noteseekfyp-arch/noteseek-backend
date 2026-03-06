import uuid
from fastapi_users import BaseUserManager
from app.models.user import User
from fastapi import Depends
from app.auth.user_db import get_user_db
import os

SECRET = os.getenv("SECRET_KEY")

class UserManager(BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
from fastapi import APIRouter
from app.auth.routes import fastapi_users
from app.auth.backend import auth_backend
from app.schemas.user import UserRead, UserCreate, UserUpdate
from app.users.routes import router as protected_router
from app.notes.routes import router as notes_router

api_router = APIRouter()

api_router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

api_router.include_router(protected_router)
api_router.include_router(notes_router)
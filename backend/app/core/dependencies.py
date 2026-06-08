from fastapi import Depends, HTTPException, status
from fastapi_users import FastAPIUsers
from app.models.user import User
from app.auth.routes import fastapi_users

current_active_user = fastapi_users.current_user(active=True)

def require_role(*roles: str):
    allowed = tuple((r or "").strip().lower() for r in roles)

    def role_checker(user: User = Depends(current_active_user)):
        role = (getattr(user, "role", None) or "").strip().lower()
        if role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return user

    return role_checker
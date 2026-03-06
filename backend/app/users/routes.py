from fastapi import APIRouter, Depends
from app.core.dependencies import require_role
from app.models.user import User

router = APIRouter(prefix="/protected", tags=["protected"])

@router.get("/student")
def student_only(user: User = Depends(require_role("student", "teacher", "admin"))):
    return {"message": f"Welcome student {user.email}"}

@router.get("/teacher")
def teacher_only(user: User = Depends(require_role("teacher", "admin"))):
    return {"message": f"Welcome teacher {user.email}"}

@router.get("/admin")
def admin_only(user: User = Depends(require_role("admin"))):
    return {"message": f"Welcome admin {user.email}"}
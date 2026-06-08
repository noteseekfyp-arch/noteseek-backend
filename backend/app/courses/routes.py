from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_role
from app.courses import schemas, service
from app.db.session import get_async_session
from app.models.user import User

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/catalog", response_model=list[schemas.CourseRead])
async def course_catalog(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    return await service.list_catalog(session)


@router.get("", response_model=list[schemas.CourseRead])
async def my_courses(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    role = (getattr(user, "role", None) or "").strip().lower()
    if role == "admin":
        return await service.list_catalog(session)
    if role == "teacher":
        return await service.list_teacher_courses(session, user.id)
    return await service.list_student_enrolled(session, user.id)


@router.get("/{course_id}", response_model=schemas.CourseRead)
async def get_course(
    course_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "teacher", "admin")),
):
    row = await service.get_course_read_for_user(session, course_id, user)
    if not row:
        raise HTTPException(status_code=404, detail="Course not found")
    return row


@router.post("", response_model=schemas.CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    data: schemas.CourseCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("teacher", "admin")),
):
    return await service.create_course(session, user.id, data)


@router.post("/{course_id}/enroll", status_code=status.HTTP_204_NO_CONTENT)
async def enroll_in_course(
    course_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(require_role("student", "admin")),
):
    try:
        await service.enroll_student(session, course_id, user.id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e)) from e

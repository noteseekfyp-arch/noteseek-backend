import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.courses import models, schemas
from app.models.user import User


def _teacher_label(user: User) -> str:
    if getattr(user, "email", None):
        local = user.email.split("@")[0]
        return local.replace(".", " ").replace("_", " ").title()
    return "Instructor"


async def get_course_or_none(session: AsyncSession, course_id: uuid.UUID) -> models.Course | None:
    r = await session.execute(select(models.Course).where(models.Course.id == course_id))
    return r.scalar_one_or_none()


async def teacher_owns_course(session: AsyncSession, course_id: uuid.UUID, teacher_id: uuid.UUID) -> bool:
    c = await get_course_or_none(session, course_id)
    return c is not None and c.teacher_id == teacher_id


async def is_enrolled(session: AsyncSession, course_id: uuid.UUID, student_id: uuid.UUID) -> bool:
    r = await session.execute(
        select(models.CourseEnrollment.id).where(
            models.CourseEnrollment.course_id == course_id,
            models.CourseEnrollment.student_id == student_id,
        )
    )
    return r.scalar_one_or_none() is not None


async def can_access_course(session: AsyncSession, course_id: uuid.UUID, user: User) -> bool:
    if user.role in ("admin",):
        return True
    c = await get_course_or_none(session, course_id)
    if not c:
        return False
    if c.teacher_id == user.id:
        return True
    if user.role == "student" and await is_enrolled(session, course_id, user.id):
        return True
    return False


async def _student_count(session: AsyncSession, course_id: uuid.UUID) -> int:
    r = await session.execute(
        select(func.count()).select_from(models.CourseEnrollment).where(
            models.CourseEnrollment.course_id == course_id
        )
    )
    return int(r.scalar_one() or 0)


async def _course_to_read(session: AsyncSession, course: models.Course) -> schemas.CourseRead:
    tr = await session.execute(select(User).where(User.id == course.teacher_id))
    teacher = tr.scalar_one()
    n = await _student_count(session, course.id)
    return schemas.CourseRead(
        id=course.id,
        title=course.title,
        description=course.description or "",
        university=course.university,
        department=course.department,
        semester=course.semester or "",
        visibility=course.visibility,
        teacher_id=course.teacher_id,
        teacher=_teacher_label(teacher),
        student_count=n,
        updated_at=course.updated_at or course.created_at,
    )


async def list_teacher_courses(session: AsyncSession, teacher_id: uuid.UUID) -> list[schemas.CourseRead]:
    r = await session.execute(
        select(models.Course).where(models.Course.teacher_id == teacher_id).order_by(models.Course.created_at.desc())
    )
    rows = r.scalars().all()
    return [await _course_to_read(session, c) for c in rows]


async def list_student_enrolled(session: AsyncSession, student_id: uuid.UUID) -> list[schemas.CourseRead]:
    r = await session.execute(
        select(models.Course)
        .join(models.CourseEnrollment, models.CourseEnrollment.course_id == models.Course.id)
        .where(models.CourseEnrollment.student_id == student_id)
        .order_by(models.Course.title)
    )
    rows = r.scalars().all()
    return [await _course_to_read(session, c) for c in rows]


async def list_catalog(session: AsyncSession) -> list[schemas.CourseRead]:
    r = await session.execute(
        select(models.Course).where(models.Course.visibility == "public").order_by(models.Course.title)
    )
    rows = r.scalars().all()
    return [await _course_to_read(session, c) for c in rows]


async def get_course_read_for_user(
    session: AsyncSession, course_id: uuid.UUID, user: User
) -> schemas.CourseRead | None:
    c = await get_course_or_none(session, course_id)
    if not c:
        return None
    if not await can_access_course(session, course_id, user):
        return None
    return await _course_to_read(session, c)


async def create_course(session: AsyncSession, teacher_id: uuid.UUID, data: schemas.CourseCreate) -> schemas.CourseRead:
    course = models.Course(
        title=data.title,
        description=data.description or "",
        university=data.university,
        department=data.department,
        semester=data.semester or "",
        visibility=data.visibility if data.visibility in ("public", "university") else "public",
        teacher_id=teacher_id,
    )
    session.add(course)
    await session.commit()
    await session.refresh(course)
    return await _course_to_read(session, course)


async def enroll_student(session: AsyncSession, course_id: uuid.UUID, student_id: uuid.UUID) -> None:
    course = await get_course_or_none(session, course_id)
    if not course:
        raise LookupError("Course not found")
    if course.teacher_id == student_id:
        raise PermissionError("You cannot enroll in a course you teach")
    existing = await session.execute(
        select(models.CourseEnrollment).where(
            models.CourseEnrollment.course_id == course_id,
            models.CourseEnrollment.student_id == student_id,
        )
    )
    if existing.scalar_one_or_none():
        return
    session.add(models.CourseEnrollment(course_id=course_id, student_id=student_id))
    await session.commit()

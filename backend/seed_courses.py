"""Seed the database with demo teachers and courses.

Run from the backend folder:  python seed_courses.py
Safe to re-run: existing teachers/courses (matched by email/title) are skipped.
"""

import asyncio

from fastapi_users.password import PasswordHelper
from sqlalchemy import select

from app.courses.models import Course
from app.db.session import AsyncSessionLocal
from app.models.user import User

# Demo teacher accounts (password for all: Teacher@123)
TEACHERS = [
    {"email": "s.jenkins@umt.edu.pk", "name": "Dr. Sarah Jenkins"},
    {"email": "r.chen@umt.edu.pk", "name": "Prof. Robert Chen"},
    {"email": "a.khan@umt.edu.pk", "name": "Dr. Ahmed Khan"},
]
TEACHER_PASSWORD = "Teacher@123"

COURSES = [
    {
        "title": "Introduction to Artificial Intelligence",
        "description": "Search, knowledge representation, machine learning basics, and intelligent agents.",
        "university": "University of Management and Technology (UMT), Lahore",
        "department": "Computer Science",
        "semester": "Semester 5",
        "teacher": "s.jenkins@umt.edu.pk",
    },
    {
        "title": "Data Structures and Algorithms",
        "description": "Arrays, linked lists, trees, graphs, sorting, searching, and complexity analysis.",
        "university": "University of Management and Technology (UMT), Lahore",
        "department": "Computer Science",
        "semester": "Semester 3",
        "teacher": "s.jenkins@umt.edu.pk",
    },
    {
        "title": "Database Systems",
        "description": "Relational model, SQL, normalization, transactions, and an intro to NoSQL stores.",
        "university": "University of Management and Technology (UMT), Lahore",
        "department": "Computer Science",
        "semester": "Semester 4",
        "teacher": "r.chen@umt.edu.pk",
    },
    {
        "title": "Operating Systems",
        "description": "Processes, threads, scheduling, memory management, and file systems.",
        "university": "University of the Punjab, Lahore",
        "department": "Computer Science",
        "semester": "Semester 4",
        "teacher": "r.chen@umt.edu.pk",
    },
    {
        "title": "Linear Algebra",
        "description": "Vectors, matrices, eigenvalues, and applications in computer science.",
        "university": "University of the Punjab, Lahore",
        "department": "Mathematics",
        "semester": "Semester 2",
        "teacher": "a.khan@umt.edu.pk",
    },
    {
        "title": "Digital Logic Design",
        "description": "Boolean algebra, combinational and sequential circuits, and FPGA basics.",
        "university": "FAST National University, Lahore",
        "department": "Electrical Engineering",
        "semester": "Semester 2",
        "teacher": "a.khan@umt.edu.pk",
    },
    {
        "title": "Software Engineering",
        "description": "SDLC, agile methods, requirements engineering, design patterns, and testing.",
        "university": "FAST National University, Lahore",
        "department": "Software Engineering",
        "semester": "Semester 5",
        "teacher": "s.jenkins@umt.edu.pk",
    },
    {
        "title": "Computer Networks",
        "description": "OSI/TCP-IP models, routing, transport protocols, and network security basics.",
        "university": "COMSATS University, Islamabad",
        "department": "Computer Science",
        "semester": "Semester 6",
        "teacher": "r.chen@umt.edu.pk",
    },
    {
        "title": "Probability and Statistics",
        "description": "Probability theory, distributions, hypothesis testing, and regression.",
        "university": "COMSATS University, Islamabad",
        "department": "Mathematics",
        "semester": "Semester 3",
        "teacher": "a.khan@umt.edu.pk",
    },
]


async def main() -> None:
    helper = PasswordHelper()
    async with AsyncSessionLocal() as session:
        # 1. Ensure demo teachers exist
        teacher_ids: dict[str, object] = {}
        for t in TEACHERS:
            existing = (
                await session.execute(select(User).where(User.email == t["email"]))
            ).scalar_one_or_none()
            if existing:
                teacher_ids[t["email"]] = existing.id
                print(f"teacher exists: {t['email']}")
            else:
                user = User(
                    email=t["email"],
                    hashed_password=helper.hash(TEACHER_PASSWORD),
                    is_active=True,
                    is_superuser=False,
                    is_verified=True,
                    role="teacher",
                )
                session.add(user)
                await session.flush()
                teacher_ids[t["email"]] = user.id
                print(f"created teacher: {t['email']} (password: {TEACHER_PASSWORD})")

        # 2. Ensure courses exist
        created = 0
        for c in COURSES:
            existing = (
                await session.execute(select(Course).where(Course.title == c["title"]))
            ).scalar_one_or_none()
            if existing:
                print(f"course exists:  {c['title']}")
                continue
            session.add(
                Course(
                    title=c["title"],
                    description=c["description"],
                    university=c["university"],
                    department=c["department"],
                    semester=c["semester"],
                    visibility="public",
                    teacher_id=teacher_ids[c["teacher"]],
                )
            )
            created += 1
            print(f"created course: {c['title']}")

        await session.commit()
        print(f"\nDone. {created} new course(s) added.")


if __name__ == "__main__":
    asyncio.run(main())

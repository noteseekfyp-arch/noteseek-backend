"use client"

import { Plus } from "lucide-react"
import { CreateCourseModal } from "@/components/course/create-course-modal"
import { TeacherCourseCard } from "@/components/course/teacher-course-card"

// Mock Data
const MOCK_COURSES = [
  {
    id: "CS101",
    title: "Introduction to Computer Science",
    department: "Computer Science",
    semester: "Fall 2024",
    students: 124,
  },
  {
    id: "CS201",
    title: "Data Structures and Algorithms",
    department: "Computer Science",
    semester: "Fall 2024",
    students: 85,
  }
]

export default function TeacherCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">Manage your courses, upload materials, and generate AI content.</p>
        </div>

        <CreateCourseModal />
      </div>

      {MOCK_COURSES.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_COURSES.map((course) => (
            <TeacherCourseCard
              key={course.id}
              title={course.title}
              students={course.students}
              updated={"Just now"}
              category={course.department}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 mt-6 border-2 border-dashed rounded-xl bg-muted/20">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Plus className="size-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Create your first course to start uploading reference materials and generating AI study guides.
          </p>
          <CreateCourseModal />
        </div>
      )}
    </div>
  )
}

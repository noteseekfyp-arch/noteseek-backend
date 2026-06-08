"use client"

import { useEffect } from "react"
import { Plus } from "lucide-react"
import { CreateCourseModal } from "@/components/course/create-course-modal"
import { TeacherCourseCard } from "@/components/course/teacher-course-card"
import { useCourses } from "@/features/courses/hooks"

function formatCourseUpdated(iso: string | null): string {
  if (!iso) return "Recently"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "Recently"
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function TeacherCoursesPage() {
  const { courses, loading, error, fetchCourses, addCourse } = useCourses()

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">Manage your courses, upload materials, and generate AI content.</p>
        </div>

        <CreateCourseModal
          onCourseCreated={(c) => {
            addCourse(c)
            void fetchCourses()
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading courses…</p>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <TeacherCourseCard
              key={course.id}
              title={course.title}
              students={course.student_count}
              updated={formatCourseUpdated(course.updated_at)}
              category={course.department}
              href={`/teacher/courses/${course.id}`}
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
          <CreateCourseModal
            onCourseCreated={(c) => {
              addCourse(c)
              void fetchCourses()
            }}
          />
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect } from "react"
import Link from "next/link"
import StatCard from "@/components/stats/stat-card"
import { TeacherCourseCard } from "@/components/course/teacher-course-card"
import { CreateCourseModal } from "@/components/course/create-course-modal"
import { Button } from "@/components/ui/button"
import { Users, BookOpenCheck, ClipboardList, Star, Plus } from "lucide-react"
import { useCourses } from "@/features/courses/hooks"

function formatCourseUpdated(iso: string | null): string {
  if (!iso) return "Recently"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "Recently"
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function TeacherDashboard() {
  const { courses, loading, error, fetchCourses, addCourse } = useCourses()

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count ?? 0), 0)

  const afterCourseCreated = (c: Parameters<typeof addCourse>[0]) => {
    addCourse(c)
    void fetchCourses()
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your courses load from the API. Use{" "}
            <Link href="/teacher/courses" className="text-primary underline-offset-4 hover:underline">
              My Courses
            </Link>{" "}
            for the full list.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <Button variant="outline" type="button" disabled title="Not implemented">
            Filter
          </Button>
          <CreateCourseModal onCourseCreated={afterCourseCreated}>
            <Button>
              <Plus className="mr-2 size-4" />
              New Course
            </Button>
          </CreateCourseModal>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={String(totalStudents)} icon={Users} />
        <StatCard
          title="Active Courses"
          value={String(courses.length)}
          icon={BookOpenCheck}
          iconBgClassName="bg-emerald-50 text-emerald-500"
        />
        <StatCard
          title="Pending Submissions"
          value="—"
          icon={ClipboardList}
          iconBgClassName="bg-amber-50 text-amber-500"
        />
        <StatCard title="Avg. Performance" value="—" icon={Star} iconBgClassName="bg-violet-50 text-violet-500" />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading courses…</p>
      ) : (
        <div className="grid md:grid-cols-4 gap-6 items-stretch">
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

          <CreateCourseModal onCourseCreated={afterCourseCreated}>
            <div className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-64 bg-muted/40 hover:bg-muted/60 transition cursor-pointer">
              <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm text-primary mb-3">
                <Plus className="size-5" />
              </div>
              <p className="font-semibold">Add New Course</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-[14rem] text-center">
                Expand your curriculum by creating a new academic space.
              </p>
            </div>
          </CreateCourseModal>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Filter, BookOpen } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeacherCourseCard } from "@/components/course/teacher-course-card"
import { CourseApi } from "@/features/courses/api"
import { getUserRole } from "@/features/auth/cookies"
import type { Course } from "@/types/course"

function formatCourseUpdated(iso: string | null): string {
  if (!iso) return "Recently"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "Recently"
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function CourseSearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    setRole(getUserRole())
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const data = await CourseApi.getCatalog()
        if (!cancelled) setCourses(data)
      } catch (e) {
        if (!cancelled) {
          setCourses([])
          setLoadError(e instanceof Error ? e.message : "Could not load catalog")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [courses, searchQuery]
  )

  async function handleEnroll(courseId: string) {
    setEnrollingId(courseId)
    try {
      await CourseApi.enroll(courseId)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Enrollment failed")
    } finally {
      setEnrollingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Explore Courses</h1>
        <p className="text-muted-foreground">
          Search and discover public courses. Students can enroll from here; teachers manage courses from the teacher
          dashboard.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <aside className="w-full md:w-64 space-y-6 shrink-0 bg-white p-5 rounded-xl border">
          <div className="flex items-center gap-2 font-semibold">
            <Filter className="size-5" />
            Filters
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>University</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  <SelectItem value="global">Global University</SelectItem>
                  <SelectItem value="state">State College</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="phys">Physics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="fall24">Fall 2024</SelectItem>
                  <SelectItem value="spring24">Spring 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full">Apply Filters</Button>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 size-5 text-muted-foreground" />
            <Input
              placeholder="Search courses by name, code, or topic..."
              className="pl-11 pr-4 py-6 text-lg rounded-xl shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading catalog…</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="space-y-3">
                  <TeacherCourseCard
                    title={course.title}
                    students={course.student_count}
                    updated={formatCourseUpdated(course.updated_at)}
                    category={course.department}
                    href={`/student/courses/${course.id}`}
                  />
                  {role === "student" && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled={enrollingId === course.id}
                      onClick={() => void handleEnroll(course.id)}
                    >
                      {enrollingId === course.id ? "Enrolling…" : "Enroll"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
              <BookOpen className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Try adjusting your search query or filters to find what you&apos;re looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

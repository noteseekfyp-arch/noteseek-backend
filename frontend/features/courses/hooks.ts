import { useCallback, useState } from "react"
import { CourseApi } from "@/features/courses/api"
import type { Course } from "@/types/course"

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await CourseApi.getCourses()
            setCourses((prev) => {
                const map = new Map<string, Course>()
                for (const c of data) {
                    map.set(c.id, c)
                }
                for (const c of prev) {
                    if (!map.has(c.id)) {
                        map.set(c.id, c)
                    }
                }
                return [...map.values()].sort((a, b) => a.title.localeCompare(b.title))
            })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load courses")
        } finally {
            setLoading(false)
        }
    }, [])

    const addCourse = useCallback((course: Course) => {
        setCourses((prev) => {
            if (prev.some((c) => c.id === course.id)) {
                return prev.map((c) => (c.id === course.id ? course : c))
            }
            return [course, ...prev]
        })
    }, [])

    return { courses, loading, error, fetchCourses, addCourse }
}

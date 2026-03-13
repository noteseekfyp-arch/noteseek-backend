import { useState } from "react"
import { CourseApi } from "@/features/courses/api"
import type { Course } from "@/types/course"

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const data = await CourseApi.getCourses()
            setCourses(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return { courses, loading, error, fetchCourses }
}

import { API_BASE_URL } from "@/config/api"
import { getAccessToken } from "@/features/auth/cookies"
import type { Course } from "@/types/course"

function bearerHeaders(): HeadersInit {
    const token = getAccessToken()
    if (!token) throw new Error("Not authenticated")
    return { Authorization: `Bearer ${token}` }
}

async function throwIfBad(res: Response): Promise<void> {
    if (res.ok) return
    let detail = res.statusText
    try {
        const body = await res.json()
        if (typeof body?.detail === "string") detail = body.detail
        else if (Array.isArray(body?.detail))
            detail = body.detail.map((x: { msg?: string }) => x?.msg ?? JSON.stringify(x)).join(", ")
    } catch {
        /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`)
}

export const CourseApi = {
    async getCourses(): Promise<Course[]> {
        const res = await fetch(`${API_BASE_URL}/courses`, {
            headers: { ...bearerHeaders() },
            cache: "no-store",
        })
        await throwIfBad(res)
        return res.json() as Promise<Course[]>
    },

    async getCatalog(): Promise<Course[]> {
        const res = await fetch(`${API_BASE_URL}/courses/catalog`, {
            headers: { ...bearerHeaders() },
            cache: "no-store",
        })
        await throwIfBad(res)
        return res.json() as Promise<Course[]>
    },

    async createCourse(data: {
        title: string
        description: string
        university: string
        department: string
        semester: string
        visibility: string
    }): Promise<Course> {
        const res = await fetch(`${API_BASE_URL}/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...bearerHeaders() },
            body: JSON.stringify({
                title: data.title,
                description: data.description,
                university: data.university,
                department: data.department,
                semester: data.semester || "",
                visibility: data.visibility === "university" ? "university" : "public",
            }),
        })
        await throwIfBad(res)
        return res.json() as Promise<Course>
    },

    async enroll(courseId: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
            method: "POST",
            headers: { ...bearerHeaders() },
        })
        if (res.status === 204) return
        await throwIfBad(res)
    },

    async getCourse(courseId: string): Promise<Course> {
        const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            headers: { ...bearerHeaders() },
            cache: "no-store",
        })
        await throwIfBad(res)
        return res.json() as Promise<Course>
    },
}

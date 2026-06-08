import { API_BASE_URL } from "@/config/api"
import { getAccessToken } from "@/features/auth/cookies"
import type { Material } from "@/types/material"

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

export const MaterialApi = {
    async list(courseId?: string | null): Promise<Material[]> {
        const q =
            courseId !== undefined && courseId !== null && courseId !== ""
                ? `?course_id=${encodeURIComponent(courseId)}`
                : ""
        const res = await fetch(`${API_BASE_URL}/materials${q}`, { headers: { ...bearerHeaders() } })
        await throwIfBad(res)
        return res.json() as Promise<Material[]>
    },

    async upload(file: File, courseId: string | null): Promise<Material> {
        const fd = new FormData()
        fd.append("file", file)
        if (courseId) fd.append("course_id", courseId)
        const res = await fetch(`${API_BASE_URL}/materials/upload`, {
            method: "POST",
            headers: { ...bearerHeaders() },
            body: fd,
        })
        await throwIfBad(res)
        return res.json() as Promise<Material>
    },
}

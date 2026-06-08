import { API_BASE_URL } from "@/config/api"
import { getAccessToken } from "@/features/auth/cookies"
import type { Note } from "@/types/note"

function bearerHeaders(): HeadersInit {
  const token = getAccessToken()
  if (!token) throw new Error("Not authenticated")
  return { Authorization: `Bearer ${token}` }
}

async function throwIfBad(res: Response): Promise<void> {
  if (res.ok) return
  if (res.status === 401) {
    throw new Error("Session expired. Please log out and log in again.")
  }
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

export const NotesApi = {
  async list(generatedOnly?: boolean): Promise<Note[]> {
    const params = new URLSearchParams()
    if (generatedOnly === true) params.set("generated_only", "true")
    else if (generatedOnly === false) params.set("generated_only", "false")
    const qs = params.toString()
    // Trailing slash avoids FastAPI 307 redirect (redirect drops Authorization via Next proxy).
    const url = qs ? `${API_BASE_URL}/notes/?${qs}` : `${API_BASE_URL}/notes/`
    const res = await fetch(url, {
      headers: { ...bearerHeaders() },
      cache: "no-store",
    })
    await throwIfBad(res)
    return res.json() as Promise<Note[]>
  },

  async get(noteId: string): Promise<Note> {
    const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      headers: { ...bearerHeaders() },
      cache: "no-store",
    })
    await throwIfBad(res)
    return res.json() as Promise<Note>
  },
}

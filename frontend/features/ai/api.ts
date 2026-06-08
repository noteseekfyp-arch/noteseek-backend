import { API_BASE_URL } from "@/config/api"
import { getAccessToken } from "@/features/auth/cookies"
import type { GeneratePayload, GenerateResult, GenerationType } from "@/types/note"

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

const UI_TO_API: Record<string, GenerationType> = {
  Flashcards: "flashcards",
  Summary: "summary",
  "Practice Quiz": "quiz",
  "Study Guide": "study_guide",
  Quiz: "quiz",
  Assignment: "assignment",
}

export function mapUiGenerationType(label: string): GenerationType {
  return UI_TO_API[label] ?? "summary"
}

export const AiApi = {
  async generate(payload: GeneratePayload): Promise<GenerateResult> {
    const res = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...bearerHeaders(),
      },
      body: JSON.stringify({
        type: payload.type,
        source_material_ids: payload.sourceMaterialIds,
        prompt: payload.prompt ?? null,
        target_course_id: payload.targetCourseId ?? null,
        page_range: payload.pageRange ?? null,
        focus: payload.focus ?? null,
      }),
    })
    await throwIfBad(res)
    const data = (await res.json()) as {
      id: string
      title: string
      type: GenerationType
      content: string
    }
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      content: data.content,
    }
  },
}

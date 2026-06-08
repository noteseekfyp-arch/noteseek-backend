import { useRouter } from "next/navigation"

import { AiApi, mapUiGenerationType } from "@/features/ai/api"
import type { ContextGeneratePayload } from "@/components/generation/context-selection-modal"
import type { GenerationType } from "@/types/note"

export function contextPayloadToGenerate(
  payload: ContextGeneratePayload,
  options?: { targetCourseId?: string; typeOverride?: GenerationType }
) {
  return AiApi.generate({
    type: options?.typeOverride ?? mapUiGenerationType(payload.type),
    sourceMaterialIds: payload.selectedFileIds,
    pageRange: payload.rangeType === "custom" ? payload.customRange : undefined,
    focus: payload.focusArea.trim() || undefined,
    targetCourseId: options?.targetCourseId,
  })
}

export function useGenerationRedirect() {
  const router = useRouter()
  return (noteId: string) => router.push(`/notes/${noteId}`)
}

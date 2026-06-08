export type GenerationType =
  | "summary"
  | "flashcards"
  | "quiz"
  | "assignment"
  | "study_guide"

export interface NoteMetadata {
  brief_summary?: string
  key_points?: string[]
  flashcards?: { front: string; back: string }[]
  quiz_questions?: {
    question: string
    options: string[]
    correct_index: number
    explanation?: string
  }[]
  assignment_sections?: { heading: string; content: string }[]
}

export interface Note {
  id: string
  title: string
  content: string
  owner_id: string
  course_id?: string | null
  kind?: string | null
  is_generated: boolean
  source_material_ids: string[]
  metadata: NoteMetadata
  created_at: string
}

export interface GeneratePayload {
  type: GenerationType
  sourceMaterialIds: string[]
  prompt?: string
  targetCourseId?: string
  pageRange?: string
  focus?: string
}

export interface GenerateResult {
  id: string
  title: string
  type: GenerationType
  content: string
}

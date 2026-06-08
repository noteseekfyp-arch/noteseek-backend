/** Matches `CourseRead` from the FastAPI `/api/courses` responses. */
export interface Course {
  id: string
  title: string
  description: string
  university: string
  /** Shown as subject tag on student cards and category on teacher cards. */
  department: string
  semester: string
  visibility: string
  teacher_id: string
  /** Display name derived from the teacher account (e.g. email local-part). */
  teacher: string
  student_count: number
  updated_at: string | null
}

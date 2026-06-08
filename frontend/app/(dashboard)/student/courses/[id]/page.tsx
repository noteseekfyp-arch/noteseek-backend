"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FileText, Download, Bot, CheckCircle, Sparkles, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, BookA, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { ContextSelectionModal } from "@/components/generation/context-selection-modal"
import { contextPayloadToGenerate } from "@/features/ai/generation-handlers"
import { CourseApi } from "@/features/courses/api"
import { MaterialApi } from "@/features/materials/api"
import { NotesApi } from "@/features/notes/api"
import type { Note } from "@/types/note"
import type { Course } from "@/types/course"
import type { Material } from "@/types/material"

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "—"
  }
}

export default function StudentCoursePage() {
  const params = useParams()
  const courseId = useMemo(() => {
    const raw = params.id
    return Array.isArray(raw) ? raw[0] : raw
  }, [params.id])

  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [courseNotes, setCourseNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [c, m, notes] = await Promise.all([
          CourseApi.getCourse(courseId),
          MaterialApi.list(courseId),
          NotesApi.list(true),
        ])
        if (!cancelled) {
          setCourse(c)
          setMaterials(m)
          setCourseNotes(notes.filter((n) => n.course_id === courseId))
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load course")
          setCourse(null)
          setMaterials([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const modalFiles = useMemo(
    () => materials.map((m) => ({ id: m.id, name: m.filename })),
    [materials]
  )

  const handleGenerate = async (payload: Parameters<typeof contextPayloadToGenerate>[0]) => {
    if (!courseId) return
    const result = await contextPayloadToGenerate(payload, { targetCourseId: courseId })
    router.push(`/notes/${result.id}`)
  }

  const handleStudyGuide = async (payload: Parameters<typeof contextPayloadToGenerate>[0]) => {
    if (!courseId) return
    const result = await contextPayloadToGenerate(payload, {
      targetCourseId: courseId,
      typeOverride: "study_guide",
    })
    router.push(`/notes/${result.id}`)
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading course…</p>
  }

  if (error || !course) {
    return (
      <div className="max-w-xl space-y-4">
        <p className="text-destructive text-sm">{error ?? "Course not found."}</p>
        <Button asChild variant="outline">
          <Link href="/student/courses">Back to courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <Badge variant="secondary">{course.id.slice(0, 8)}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="size-4" /> Instructor: {course.teacher}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-4" /> {course.university}
            </span>
            <span className="flex items-center gap-1.5">
              <BookA className="size-4" /> {course.department}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {course.semester}
            </span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 pointer-events-none">
            <CheckCircle className="mr-2 size-4" /> Enrolled
          </Button>
          <ContextSelectionModal
            defaultType="Summary"
            availableFiles={modalFiles}
            onGenerate={handleStudyGuide}
          >
            <Button variant="default" className="gap-2 shrink-0" disabled={modalFiles.length === 0}>
              <Sparkles className="size-4" /> Generate Study Guide
            </Button>
          </ContextSelectionModal>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="materials">Course Materials</TabsTrigger>
          <TabsTrigger value="assessments">Pending Assessments</TabsTrigger>
          <TabsTrigger value="my-notes">My AI Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Materials Provided by Instructor</CardTitle>
              <CardDescription>
                Download slides and documents or generate active recall materials directly from them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 font-medium border-b bg-muted/50 text-sm">
                  <div>File Name</div>
                  <div className="w-28 text-right">Uploaded</div>
                  <div className="w-48 text-right">Actions</div>
                </div>
                {materials.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 text-sm items-center border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-blue-500" />
                      <div>
                        <p className="font-medium truncate max-w-[200px] sm:max-w-[400px]">{file.filename}</p>
                      </div>
                    </div>
                    <div className="w-28 text-right text-muted-foreground">{fmtDate(file.uploaded_at)}</div>
                    <div className="w-48 flex justify-end gap-2">
                      <ContextSelectionModal
                        defaultType="Flashcards"
                        availableFiles={[{ id: file.id, name: file.filename }]}
                        onGenerate={handleGenerate}
                      >
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-primary">
                          <Wand2 className="size-3.5" /> <span className="hidden sm:inline">AI Generate</span>
                        </Button>
                      </ContextSelectionModal>
                      <Button variant="ghost" size="sm" className="h-8" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="size-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
                {materials.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No materials uploaded for this course yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessments</CardTitle>
              <CardDescription>There is no assessment API wired yet. This list will populate from the backend when available.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No pending assessments.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Generated Library</CardTitle>
              <CardDescription>AI-generated notes and study guides for this course.</CardDescription>
            </CardHeader>
            <CardContent>
              {courseNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No generated content for this course yet.</p>
              ) : (
                <div className="space-y-3">
                  {courseNotes.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{n.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {n.kind?.replace("_", " ")} · {fmtDate(n.created_at)}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/notes/${n.id}`}>Open</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

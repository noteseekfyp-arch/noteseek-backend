"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FileText, Download, Upload, Bot, CheckCircle, FileUp, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, BookA, Clock, Users } from "lucide-react"
import { ContextSelectionModal } from "@/components/generation/context-selection-modal"
import { contextPayloadToGenerate } from "@/features/ai/generation-handlers"
import { CourseApi } from "@/features/courses/api"
import { MaterialApi } from "@/features/materials/api"
import { NotesApi } from "@/features/notes/api"
import type { Course } from "@/types/course"
import type { Material } from "@/types/material"
import type { Note } from "@/types/note"

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "—"
  }
}

export default function TeacherCoursePage() {
  const params = useParams()
  const courseId = useMemo(() => {
    const raw = params.id
    return Array.isArray(raw) ? raw[0] : raw
  }, [params.id])

  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [generated, setGenerated] = useState<Note[]>([])
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
          setGenerated(notes.filter((n) => n.course_id === courseId))
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

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading course…</p>
  }

  if (error || !course) {
    return (
      <div className="max-w-xl space-y-4">
        <p className="text-destructive text-sm">{error ?? "Course not found."}</p>
        <Button asChild variant="outline">
          <Link href="/teacher/courses">Back to courses</Link>
        </Button>
      </div>
    )
  }

  const visibilityLabel = course.visibility === "university" ? "University only" : "Public"

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <Badge variant="secondary">{course.id.slice(0, 8)}</Badge>
            <Badge
              variant="outline"
              className={
                course.visibility === "public" ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"
              }
            >
              {visibilityLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="size-4" /> {course.university}
            </span>
            <span className="flex items-center gap-1.5">
              <BookA className="size-4" /> {course.department}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {course.semester}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {course.student_count} students enrolled
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" type="button" disabled title="Not implemented">
            Edit Course
          </Button>
          <Button variant="outline" type="button" disabled title="Not implemented">
            Share
          </Button>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="generated">Generated Content</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Upload files for AI processing and student access.</CardDescription>
              </div>
              <Button asChild>
                <Link href="/teacher/materials">
                  <Upload className="mr-2 size-4" /> Upload Material
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 font-medium border-b bg-muted/50 text-sm">
                  <div>File Name</div>
                  <div className="w-28 text-right">Uploaded</div>
                  <div className="w-20 text-right">Actions</div>
                </div>
                {materials.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 text-sm items-center border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.filename}</p>
                      </div>
                    </div>
                    <div className="w-28 text-right text-muted-foreground">{fmtDate(file.uploaded_at)}</div>
                    <div className="w-20 flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="size-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" type="button" disabled>
                        <MoreVertical className="size-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </div>
                  </div>
                ))}
                {materials.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No materials yet. Use Upload Material to add files to this course.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <Bot className="size-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Generate Quiz</CardTitle>
                <CardDescription>Create assessments based on uploaded materials.</CardDescription>
              </CardHeader>
              <CardFooter>
                <ContextSelectionModal defaultType="Quiz" availableFiles={modalFiles} onGenerate={handleGenerate}>
                  <Button className="w-full" variant="secondary">
                    Start Generation
                  </Button>
                </ContextSelectionModal>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <FileUp className="size-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Generate Assignment</CardTitle>
                <CardDescription>Create complex assignments and rubrics.</CardDescription>
              </CardHeader>
              <CardFooter>
                <ContextSelectionModal defaultType="Assignment" availableFiles={modalFiles} onGenerate={handleGenerate}>
                  <Button className="w-full" variant="secondary">
                    Start Generation
                  </Button>
                </ContextSelectionModal>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <CheckCircle className="size-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Generate Summary</CardTitle>
                <CardDescription>Synthesize long documents into quick notes.</CardDescription>
              </CardHeader>
              <CardFooter>
                <ContextSelectionModal defaultType="Summary" availableFiles={modalFiles} onGenerate={handleGenerate}>
                  <Button className="w-full" variant="secondary">
                    Start Generation
                  </Button>
                </ContextSelectionModal>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generated" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content Library</CardTitle>
              <CardDescription>Review and open previously AI-generated materials for this course.</CardDescription>
            </CardHeader>
            <CardContent>
              {generated.length === 0 ? (
                <p className="text-sm text-muted-foreground">No generated content yet.</p>
              ) : (
                <div className="space-y-3">
                  {generated.map((n) => (
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

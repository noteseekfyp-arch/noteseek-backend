"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardCheck, Sparkles, Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CourseApi } from "@/features/courses/api"
import { MaterialApi } from "@/features/materials/api"
import { AiApi } from "@/features/ai/api"
import type { Course } from "@/types/course"
import type { Material } from "@/types/material"

export default function TeacherCreateQuizPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState("")
  const [notice, setNotice] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const loadCourses = useCallback(async () => {
    try {
      setCourses(await CourseApi.getCourses())
    } catch {
      setCourses([])
    }
  }, [])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  useEffect(() => {
    if (!selectedCourse) {
      setMaterials([])
      setSelectedMaterial("")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const m = await MaterialApi.list(selectedCourse)
        if (!cancelled) setMaterials(m)
      } catch {
        if (!cancelled) setMaterials([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedCourse])

  const handleCreate = async () => {
    setNotice(null)
    setIsGenerating(true)
    try {
      const result = await AiApi.generate({
        type: "quiz",
        sourceMaterialIds: [selectedMaterial],
        targetCourseId: selectedCourse,
      })
      router.push(`/notes/${result.id}`)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ClipboardCheck className="size-6" />
          </div>
          AI Quiz Generator
        </h1>
        <p className="mt-2 text-muted-foreground">
          Target course and materials are loaded from the API. Quizzes are generated via your self-hosted Ollama model.
        </p>
      </div>

      {notice && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{notice}</p>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-6">
          <CardTitle>Quiz Parameters</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Target Course</Label>
              <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedMaterial("") }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial} disabled={!selectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedCourse ? "Select file…" : "Select course first"} />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Quiz Title</Label>
              <Input placeholder="e.g. Chapter 3 Micro-Quiz" />
            </div>
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Input type="number" defaultValue={10} min={1} max={50} />
            </div>
            <div className="space-y-2">
              <Label>Time Limit (Minutes)</Label>
              <Input type="number" defaultValue={15} min={5} />
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 items-start">
            <Bot className="size-5 shrink-0 text-primary mt-0.5" />
            <p className="text-sm text-primary-800 leading-relaxed">
              After generation is implemented, you will be able to review and edit questions before publishing.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t p-6 flex justify-end">
          <Button
            size="lg"
            onClick={() => void handleCreate()}
            disabled={isGenerating || !selectedCourse || !selectedMaterial}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isGenerating ? "Generating…" : (
              <>
                Generate Quiz <Sparkles className="ml-2 size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

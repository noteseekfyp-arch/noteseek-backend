"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FilePlus2, Sparkles, Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CourseApi } from "@/features/courses/api"
import { MaterialApi } from "@/features/materials/api"
import { AiApi } from "@/features/ai/api"
import type { Course } from "@/types/course"
import type { Material } from "@/types/material"

export default function TeacherCreateAssignmentPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState("")
  const [prompt, setPrompt] = useState("")
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
      const sourceIds = selectedMaterial
        ? [selectedMaterial]
        : materials.map((m) => m.id)
      if (sourceIds.length === 0) {
        throw new Error("Upload at least one course material to use as context.")
      }
      const result = await AiApi.generate({
        type: "assignment",
        sourceMaterialIds: sourceIds,
        prompt: prompt.trim() || undefined,
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
            <FilePlus2 className="size-6" />
          </div>
          AI Assignment Creator
        </h1>
        <p className="mt-2 text-muted-foreground">
          Course and material lists come from the API. Rubric generation will call the AI route when it exists.
        </p>
      </div>

      {notice && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{notice}</p>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-6">
          <CardTitle>Configuration Setup</CardTitle>
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
              <Label>Source Context (Optional)</Label>
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

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Assignment Title</Label>
              <Input placeholder="e.g. Midterm Essay: The Impact of AI..." />
            </div>
            <div className="space-y-2">
              <Label>Max Points Allowed</Label>
              <Input type="number" defaultValue={100} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>AI Prompt / Assignment Focus</Label>
            <Textarea
              placeholder="Describe what the students should do."
              className="resize-none h-32"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border flex gap-3 items-start">
            <Bot className="size-5 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Optional source file helps anchor the model to your uploaded material.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t p-6 flex justify-end">
          <Button
            size="lg"
            onClick={() => void handleCreate()}
            disabled={isGenerating || !selectedCourse}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isGenerating ? "Generating…" : (
              <>
                Generate via AI <Sparkles className="ml-2 size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

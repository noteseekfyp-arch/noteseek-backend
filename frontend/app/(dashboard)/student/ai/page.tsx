"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Bot, ChevronRight, GraduationCap, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CourseApi } from "@/features/courses/api"
import { MaterialApi } from "@/features/materials/api"
import { AiApi, mapUiGenerationType } from "@/features/ai/api"
import type { Course } from "@/types/course"
import type { Material } from "@/types/material"

export default function StudentAIGeneratorPage() {
  const [generationType, setGenerationType] = useState("Flashcards")
  const [sourceType, setSourceType] = useState("course")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState("")
  const [prompt, setPrompt] = useState("")
  const [notice, setNotice] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([])
  const [personalMaterials, setPersonalMaterials] = useState<Material[]>([])

  const loadCourses = useCallback(async () => {
    try {
      setCourses(await CourseApi.getCourses())
    } catch {
      setCourses([])
    }
  }, [])

  const loadPersonal = useCallback(async () => {
    try {
      setPersonalMaterials(await MaterialApi.list(null))
    } catch {
      setPersonalMaterials([])
    }
  }, [])

  useEffect(() => {
    void loadCourses()
    void loadPersonal()
  }, [loadCourses, loadPersonal])

  useEffect(() => {
    if (sourceType !== "course" || !selectedCourse) {
      setCourseMaterials([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const m = await MaterialApi.list(selectedCourse)
        if (!cancelled) setCourseMaterials(m)
      } catch {
        if (!cancelled) setCourseMaterials([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sourceType, selectedCourse])

  const handleGenerate = async () => {
    setNotice(null)
    setIsGenerating(true)
    try {
      let sourceIds: string[] = []
      if (sourceType === "personal") {
        sourceIds = [selectedMaterial]
      } else if (selectedMaterial) {
        sourceIds = [selectedMaterial]
      } else {
        sourceIds = courseMaterials.map((m) => m.id)
      }
      if (sourceIds.length === 0) {
        throw new Error("Select at least one material or upload course files first.")
      }
      const result = await AiApi.generate({
        type: mapUiGenerationType(generationType),
        sourceMaterialIds: sourceIds,
        prompt: prompt.trim() || undefined,
        targetCourseId: sourceType === "course" ? selectedCourse : undefined,
      })
      router.push(`/notes/${result.id}`)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  const materialOptions = sourceType === "course" ? courseMaterials : personalMaterials

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Sparkles className="size-6" />
          </div>
          Global AI Generator
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Configure a generation request. Content is produced by your self-hosted Ollama instance via the NoteSeek API.
        </p>
      </div>

      {notice && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3" role="status">
          {notice}
        </p>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-6">
          <CardTitle>Configure Your Generation</CardTitle>
          <CardDescription>Follow the steps below to instruct the AI what to build for you.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                1
              </span>
              What would you like to build?
            </h3>
            <div className="pl-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Flashcards", "Summary", "Practice Quiz", "Study Guide"].map((type) => (
                <div
                  key={type}
                  onClick={() => setGenerationType(type)}
                  className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${
                    generationType === type
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-muted hover:border-primary/40 text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  <Bot className={`size-6 mx-auto mb-2 ${generationType === type ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium text-sm">{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                2
              </span>
              Where should the AI pull the information from?
            </h3>
            <div className="pl-8 space-y-6">
              <RadioGroup value={sourceType} onValueChange={setSourceType} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="course" id="source-course" />
                  <Label htmlFor="source-course" className="flex items-center gap-2 cursor-pointer">
                    <GraduationCap className="size-4" /> Enrolled Courses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="source-personal" />
                  <Label htmlFor="source-personal" className="flex items-center gap-2 cursor-pointer">
                    <UploadCloud className="size-4" /> Personal Uploads
                  </Label>
                </div>
              </RadioGroup>

              <div className="grid sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border">
                {sourceType === "course" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Select Course</Label>
                      <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedMaterial("") }}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Choose a course..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Select Material (Optional)</Label>
                      <Select value={selectedMaterial} onValueChange={setSelectedMaterial} disabled={!selectedCourse}>
                        <SelectTrigger className="bg-background">
                          <SelectValue
                            placeholder={selectedCourse ? "Select a file…" : "Select course first"}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {materialOptions.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.filename}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 col-span-2">
                    <Label>Select Personal File</Label>
                    <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                      <SelectTrigger className="bg-background w-full sm:w-1/2">
                        <SelectValue placeholder="Choose from your vault…" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {personalMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.filename}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                3
              </span>
              Additional specific instructions (Optional)
            </h3>
            <div className="pl-8">
              <Textarea
                placeholder="E.g. Make sure the flashcards focus heavily on the mathematical formulas..."
                className="resize-none min-h-24"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/10 border-t p-6 flex justify-end">
          <Button
            className="w-full sm:w-auto min-w-40"
            size="lg"
            onClick={() => void handleGenerate()}
            disabled={
              isGenerating ||
              (sourceType === "course" && !selectedCourse) ||
              (sourceType === "personal" && !selectedMaterial)
            }
          >
            {isGenerating ? "AI is working…" : (
              <>
                Generate {generationType} <ChevronRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

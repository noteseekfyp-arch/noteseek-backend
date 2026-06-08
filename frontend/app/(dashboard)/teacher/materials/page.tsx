"use client"

import { useEffect, useState } from "react"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CourseApi } from "@/features/courses/api"
import { MaterialApi } from "@/features/materials/api"
import type { Course } from "@/types/course"

export default function TeacherMaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await CourseApi.getCourses()
        if (!cancelled) setCourses(list)
      } catch {
        if (!cancelled) setCourses([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file || !selectedCourse) return
    setIsUploading(true)
    setIsCompleted(false)
    try {
      await MaterialApi.upload(file, selectedCourse)
      setIsCompleted(true)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      input.value = ""
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Material Upload</h1>
        <p className="mt-2 text-muted-foreground">
          Upload syllabi, slide decks, or readings, and assign them directly to any of your active courses.
        </p>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-6">
          <CardTitle>File Upload Portal</CardTitle>
          <CardDescription>Select a destination course before uploading.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold">1. Select Destination Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Select a course to attach material to..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {courses.length === 0 && (
              <p className="text-sm text-muted-foreground">Create a course first from the Courses page.</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">2. Choose File to Upload</Label>

            {isCompleted ? (
              <div className="border-2 border-green-200 bg-green-50 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="size-10 text-green-600 mb-3" />
                <h3 className="font-semibold text-lg text-green-900">Upload Successful!</h3>
                <p className="text-green-700 text-sm mt-1">
                  The material has been added to the selected course and is now available for students.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 bg-white hover:bg-green-50"
                  onClick={() => setIsCompleted(false)}
                >
                  Upload Another File
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-12 transition-colors relative flex flex-col items-center justify-center text-center ${
                  selectedCourse
                    ? "bg-muted/10 hover:bg-muted/30 border-primary/50 cursor-pointer"
                    : "bg-muted/30 border-muted opacity-50 cursor-not-allowed"
                }`}
              >
                {isUploading ? (
                  <>
                    <Upload className="size-10 text-primary mb-4 animate-bounce" />
                    <h3 className="font-medium text-lg">Uploading to course...</h3>
                    <p className="text-muted-foreground text-sm mt-1">Please do not close this window.</p>
                  </>
                ) : (
                  <>
                    <FileText className="size-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">Click or drag file to this area to upload</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-4">
                      Support for a single or bulk upload. Strictly PDFs, PPTXs, or DOCXs.
                    </p>
                    {selectedCourse ? (
                      <Button type="button">Browse Files</Button>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md text-sm font-medium">
                        <AlertCircle className="size-4" /> Please select a course first
                      </div>
                    )}
                  </>
                )}

                <input
                  type="file"
                  disabled={!selectedCourse || isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={(e) => void handleUpload(e)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

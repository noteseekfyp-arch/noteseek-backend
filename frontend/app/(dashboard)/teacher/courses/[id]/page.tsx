"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { FileText, Download, Upload, Bot, CheckCircle, FileUp, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, BookA, Clock, Users } from "lucide-react"

// Mock Data
const MOCK_FILES = [
  { id: 1, name: "Lecture_01_Introduction.pdf", date: "Oct 12, 2024", size: "2.4 MB" },
  { id: 2, name: "Chapter_3_Slides.pptx", date: "Oct 15, 2024", size: "5.1 MB" },
  { id: 3, name: "Midterm_Study_Guide.docx", date: "Oct 20, 2024", size: "1.2 MB" },
]

const MOCK_GENERATED = [
  { id: 1, title: "Midterm Practice Quiz", date: "Oct 21, 2024", type: "Quiz" },
  { id: 2, title: "Assignment #1: Intro Concepts", date: "Oct 18, 2024", type: "Assignment" },
  { id: 3, title: "Chapter 3 Summary", date: "Oct 16, 2024", type: "Summary" },
]

export default function TeacherCoursePage() {
  const params = useParams()
  const courseId = params.id

  // Real implementation will fetch course by ID
  const course = {
    title: "Introduction to Computer Science",
    code: "CS101",
    department: "Computer Science",
    university: "Global University",
    semester: "Fall 2024",
    students: 124,
    visibility: "Public"
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Course Info Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <Badge variant="secondary">{course.code}</Badge>
            <Badge variant="outline" className={course.visibility === "Public" ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"}>
              {course.visibility}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Building2 className="size-4" /> {course.university}</span>
            <span className="flex items-center gap-1.5"><BookA className="size-4" /> {course.department}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4" /> {course.semester}</span>
            <span className="flex items-center gap-1.5"><Users className="size-4" /> {course.students} Students Enrolled</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Edit Course</Button>
          <Button onClick={() => alert("Open Share Modal")}>Share</Button>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="generated">Generated Content</TabsTrigger>
        </TabsList>

        {/* MATERIALS TAB */}
        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Upload files for AI processing and student access.</CardDescription>
              </div>
              <Button>
                <Upload className="mr-2 size-4" /> Upload Material
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 font-medium border-b bg-muted/50 text-sm">
                  <div>File Name</div>
                  <div className="w-24 text-right">Date</div>
                  <div className="w-20 text-right">Actions</div>
                </div>
                {MOCK_FILES.map((file) => (
                  <div key={file.id} className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 text-sm items-center border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <div className="w-24 text-right text-muted-foreground">{file.date}</div>
                    <div className="w-20 flex justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="size-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <MoreVertical className="size-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI TOOLS TAB */}
        <TabsContent value="ai-tools" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <Bot className="size-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Generate Quiz</CardTitle>
                <CardDescription>Create assessments based on uploaded materials.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" variant="secondary">Start Generation</Button>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <FileUp className="size-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Generate Assignment</CardTitle>
                <CardDescription>Create complex assignments and rubrics.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" variant="secondary">Start Generation</Button>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <CheckCircle className="size-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Generate Summary</CardTitle>
                <CardDescription>Synthesize long documents into quick notes.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" variant="secondary">Start Generation</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* GENERATED CONTENT TAB */}
        <TabsContent value="generated" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content Library</CardTitle>
              <CardDescription>Review and download previously AI-generated materials.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_GENERATED.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        {item.type === "Quiz" && <Bot className="size-5 text-primary" />}
                        {item.type === "Assignment" && <FileUp className="size-5 text-primary" />}
                        {item.type === "Summary" && <FileText className="size-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.type}</Badge>
                          <span>Generated: {item.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        <Download className="mr-2 size-3" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Download className="mr-2 size-3" /> DOCX
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

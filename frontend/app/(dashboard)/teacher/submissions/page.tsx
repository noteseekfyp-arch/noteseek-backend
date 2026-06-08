"use client"

import { useState } from "react"
import { Search, ClipboardList } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function TeacherSubmissionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const submissions: never[] = []

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Submissions</h1>
        <p className="mt-1 text-muted-foreground">
          Grade assignments and quizzes. Data will load from `GET /api/submissions` (or equivalent) when implemented.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name…"
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending">Needs grading (0)</TabsTrigger>
          <TabsTrigger value="graded">Graded (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" />
                Pending
              </CardTitle>
              <CardDescription>No submissions to grade yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {submissions.length === 0
                  ? "Wire the submissions API to list student work here."
                  : "Filtered results would appear here."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graded" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Graded</CardTitle>
              <CardDescription>Previously graded submissions will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No graded submissions yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

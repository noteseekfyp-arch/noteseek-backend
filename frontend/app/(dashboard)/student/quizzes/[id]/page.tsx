"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentQuizPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Quiz ID: <span className="font-mono text-foreground">{id}</span>
          </p>
          <p>
            There is no quiz-taking API wired yet. When `GET /api/assessments/:id` returns questions, this page will
            render the attempt UI from the server.
          </p>
          <Button asChild variant="outline">
            <Link href="/student/quizzes">Back to quizzes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

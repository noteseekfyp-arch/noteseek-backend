"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentAssignmentPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Assignment ID: <span className="font-mono text-foreground">{id}</span>
          </p>
          <p>
            There is no assignment-detail API wired yet. When `GET /api/assessments/:id` (or equivalent) exists, this
            page will load instructions and the submission form from the server.
          </p>
          <Button asChild variant="outline">
            <Link href="/student/assignments">Back to assignments</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

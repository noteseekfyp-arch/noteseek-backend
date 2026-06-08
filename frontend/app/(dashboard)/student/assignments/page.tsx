"use client"

import { FileUp, CheckCircle2 } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudentAssignmentsGlobalPage() {
  const pendingAssignments: never[] = []
  const completedAssignments: never[] = []

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
        <p className="mt-1 text-muted-foreground">
          Track and submit coursework from enrolled courses. Data loads from the assessments API when it exists.
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
            <CheckCircle2 className="size-12 mx-auto mb-3 text-green-500/50" />
            <p className="font-medium text-foreground text-lg mb-1">No pending assignments</p>
            <p className="text-sm">Connect `GET /api/courses/:id/assessments` (or your assignments list) to populate this tab.</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
            <FileUp className="size-12 mx-auto mb-3 text-muted" />
            <p className="font-medium text-foreground text-lg mb-1">No completed assignments</p>
            <p className="text-sm">Submissions will appear here once the submissions API is wired.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { Bot, CheckCircle2 } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudentQuizzesGlobalPage() {
  const pendingQuizzes: never[] = []
  const completedQuizzes: never[] = []

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
        <p className="mt-1 text-muted-foreground">Upcoming and completed quizzes will load from the assessments API.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="pending">Pending ({pendingQuizzes.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedQuizzes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
            <CheckCircle2 className="size-12 mx-auto mb-3 text-green-500/50" />
            <p className="font-medium text-foreground text-lg mb-1">No pending quizzes</p>
            <p className="text-sm">Connect your quizzes list endpoint to populate this tab.</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
            <Bot className="size-12 mx-auto mb-3 text-muted" />
            <p className="font-medium text-foreground text-lg mb-1">No completed quizzes</p>
            <p className="text-sm">Results will appear here when the API is available.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

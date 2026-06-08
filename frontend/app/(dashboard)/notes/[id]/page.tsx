"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  BookOpen,
  Lightbulb,
  FileDigit,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { NotesApi } from "@/features/notes/api"
import type { Note } from "@/types/note"

function renderMarkdownish(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-xl font-semibold mt-6 mb-2">
          {line.slice(3)}
        </h2>
      )
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="text-lg font-medium mt-4 mb-2">
          {line.slice(4)}
        </h3>
      )
    if (line.startsWith("- "))
      return (
        <li key={i} className="ml-4 text-muted-foreground">
          {line.slice(2)}
        </li>
      )
    if (!line.trim()) return <br key={i} />
    return (
      <p key={i} className="text-muted-foreground leading-relaxed mb-2">
        {line}
      </p>
    )
  })
}

function defaultTabForKind(kind?: string | null) {
  if (kind === "flashcards") return "flashcards"
  if (kind === "quiz") return "quiz"
  return "content"
}

export default function AINotesPage() {
  const params = useParams()
  const noteId = useMemo(() => {
    const raw = params.id
    return Array.isArray(raw) ? raw[0] : raw
  }, [params.id])

  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    if (!noteId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await NotesApi.get(noteId)
        if (!cancelled) {
          setNote(data)
          setActiveTab(defaultTabForKind(data.kind))
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load note")
          setNote(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [noteId])

  const flashcards = note?.metadata?.flashcards ?? []
  const quizQuestions = note?.metadata?.quiz_questions ?? []
  const currentCard = flashcards[cardIndex]
  const isQuiz = note?.kind === "quiz"
  const isFlashcards = note?.kind === "flashcards"

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading generated content…</p>
  }

  if (error || !note) {
    return (
      <div className="space-y-4 max-w-xl">
        <p className="text-destructive text-sm">{error ?? "Note not found."}</p>
        <Button asChild variant="outline">
          <Link href="/student/notes">Back to vault</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{note.title}</h1>
            {note.is_generated && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Generated
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4" />
            <span className="capitalize">{note.kind?.replace("_", " ") ?? "Note"}</span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/student/notes">Back to vault</Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="content">{isQuiz ? "Overview" : "Notes"}</TabsTrigger>
          {!isFlashcards && (
            <>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="keypoints">Key Points</TabsTrigger>
            </>
          )}
          {(flashcards.length > 0 || isFlashcards) && (
            <TabsTrigger value="flashcards">Flashcards ({flashcards.length})</TabsTrigger>
          )}
          {(quizQuestions.length > 0 || isQuiz) && (
            <TabsTrigger value="quiz">Quiz ({quizQuestions.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{isQuiz ? "Quiz overview" : "Study notes"}</CardTitle>
              <CardDescription>Generated from your uploaded PDF via Ollama.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">{renderMarkdownish(note.content)}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" /> Brief summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {note.metadata.brief_summary || "No summary stored."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keypoints" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-4 text-amber-500" /> Key takeaways
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {(note.metadata.key_points ?? []).map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
                {(note.metadata.key_points ?? []).length === 0 && (
                  <p className="text-muted-foreground text-sm">No key points stored.</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards" className="mt-4">
          <Card className="max-w-lg mx-auto bg-slate-50 border-dashed">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileDigit className="size-4 text-violet-500" /> Flashcard deck
              </CardTitle>
              <CardDescription>{flashcards.length} cards</CardDescription>
            </CardHeader>
            <CardContent>
              {currentCard ? (
                <button
                  type="button"
                  onClick={() => setShowBack((b) => !b)}
                  className="w-full min-h-48 bg-white rounded-xl shadow-sm border p-6 flex items-center justify-center text-center hover:shadow-md transition"
                >
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">
                      {showBack ? "Back" : "Front"}
                    </p>
                    <p className="font-medium text-lg">
                      {showBack ? currentCard.back : currentCard.front}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">Click to flip</p>
                  </div>
                </button>
              ) : (
                <p className="text-sm text-muted-foreground text-center">No flashcards in this artifact.</p>
              )}
            </CardContent>
            {flashcards.length > 0 && (
              <CardFooter className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    setCardIndex((i) => i - 1)
                    setShowBack(false)
                  }}
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <span className="text-sm">
                  {cardIndex + 1} / {flashcards.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cardIndex >= flashcards.length - 1}
                  onClick={() => {
                    setCardIndex((i) => i + 1)
                    setShowBack(false)
                  }}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4 text-primary" /> Quiz questions
              </CardTitle>
              <CardDescription>{quizQuestions.length} multiple-choice questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizQuestions.map((q, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <p className="font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <ul className="space-y-1 text-sm">
                    {(q.options ?? []).map((opt, j) => (
                      <li
                        key={j}
                        className={
                          j === q.correct_index
                            ? "text-green-700 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {String.fromCharCode(65 + j)}. {opt}
                        {j === q.correct_index ? " ✓" : ""}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <p className="text-xs text-muted-foreground border-t pt-2">{q.explanation}</p>
                  )}
                </div>
              ))}
              {quizQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground">No quiz questions in this artifact.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

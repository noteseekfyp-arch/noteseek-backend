"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, Download, UploadCloud, Bot, Sparkles, Folder } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContextSelectionModal } from "@/components/generation/context-selection-modal"
import { contextPayloadToGenerate } from "@/features/ai/generation-handlers"
import { MaterialApi } from "@/features/materials/api"
import { NotesApi } from "@/features/notes/api"
import type { Material } from "@/types/material"
import type { Note } from "@/types/note"

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return "—"
  }
}

export default function StudentNotesPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [generated, setGenerated] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [generatedLoading, setGeneratedLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const list = await MaterialApi.list(null)
      setMaterials(list)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load files")
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshGenerated = useCallback(async () => {
    setGeneratedLoading(true)
    try {
      setGenerated(await NotesApi.list(true))
    } catch {
      setGenerated([])
    } finally {
      setGeneratedLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    void refreshGenerated()
  }, [refresh, refreshGenerated])

  const modalFiles = materials.map((m) => ({ id: m.id, name: m.filename }))

  const handleGenerate = async (payload: Parameters<typeof contextPayloadToGenerate>[0]) => {
    const result = await contextPayloadToGenerate(payload)
    await refreshGenerated()
    router.push(`/notes/${result.id}`)
  }

  const handleUploadPick = () => fileRef.current?.click()

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    setUploading(true)
    try {
      await MaterialApi.upload(f, null)
      await refresh()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Study Vault</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your own personal materials to generate smart summaries, flashcards, and study guides.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => void onFileChange(e)}
      />

      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
            <UploadCloud className="size-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload a PDF</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Upload lecture slides or notes, then generate study materials with Ollama (gemma3:4b) on your machine.
          </p>
          <Button onClick={handleUploadPick} disabled={uploading} className="px-8">
            {uploading ? "Uploading…" : "Browse Files"}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="files">My Uploaded Files</TabsTrigger>
          <TabsTrigger value="generated">AI Generated Library</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle>Personal Files</CardTitle>
                <CardDescription>Generate study materials directly from your uploads.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <ContextSelectionModal
                  defaultType="Summary"
                  availableFiles={modalFiles}
                  onGenerate={handleGenerate}
                >
                  <Button variant="default" className="gap-2" disabled={modalFiles.length === 0}>
                    <Sparkles className="size-4" /> Notes
                  </Button>
                </ContextSelectionModal>
                <ContextSelectionModal
                  defaultType="Quiz"
                  availableFiles={modalFiles}
                  onGenerate={handleGenerate}
                >
                  <Button variant="secondary" className="gap-2" disabled={modalFiles.length === 0}>
                    Quiz
                  </Button>
                </ContextSelectionModal>
                <ContextSelectionModal
                  defaultType="Flashcards"
                  availableFiles={modalFiles}
                  onGenerate={handleGenerate}
                >
                  <Button variant="secondary" className="gap-2" disabled={modalFiles.length === 0}>
                    Flashcards
                  </Button>
                </ContextSelectionModal>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div className="divide-y border-b">
                  {materials.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                          <FileText className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">{fmtDate(file.uploaded_at)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0 justify-end">
                        <ContextSelectionModal
                          defaultType="Summary"
                          availableFiles={[{ id: file.id, name: file.filename }]}
                          onGenerate={handleGenerate}
                        >
                          <Button variant="outline" size="sm">
                            Notes
                          </Button>
                        </ContextSelectionModal>
                        <ContextSelectionModal
                          defaultType="Quiz"
                          availableFiles={[{ id: file.id, name: file.filename }]}
                          onGenerate={handleGenerate}
                        >
                          <Button variant="outline" size="sm">
                            Quiz
                          </Button>
                        </ContextSelectionModal>
                        <ContextSelectionModal
                          defaultType="Flashcards"
                          availableFiles={[{ id: file.id, name: file.filename }]}
                          onGenerate={handleGenerate}
                        >
                          <Button variant="outline" size="sm">
                            Flashcards
                          </Button>
                        </ContextSelectionModal>
                        <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Download className="size-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}

                  {materials.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                      <Folder className="size-12 mb-3 text-muted" />
                      <p>No files uploaded yet.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="mt-6">
          {generatedLoading ? (
            <p className="text-sm text-muted-foreground p-6">Loading generated library…</p>
          ) : generated.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
              <Bot className="size-12 mx-auto mb-3 text-muted" />
              <p className="font-medium text-foreground text-lg mb-1">No generated content</p>
              <p className="text-sm">Generate summaries or flashcards from your uploads to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {generated.map((item) => (
                <Card key={item.id} className="hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="capitalize">{item.kind?.replace("_", " ") ?? "Generated"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">{fmtDate(item.created_at)}</p>
                    <Button asChild size="sm">
                      <Link href={`/notes/${item.id}`}>Open</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

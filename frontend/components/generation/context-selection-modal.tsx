"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Bot, FileText, CheckCircle2, ChevronRight, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export type ContextGeneratePayload = {
  type: string
  selectedFileIds: string[]
  rangeType: string
  customRange: string
  focusArea: string
}

interface ContextSelectionModalProps {
  children?: ReactNode
  defaultType?: "Quiz" | "Assignment" | "Summary" | "Flashcards"
  availableFiles?: { id: string; name: string }[]
  /** When set, runs instead of a no-op (wire to `POST /api/ai/generate` later). */
  onGenerate?: (payload: ContextGeneratePayload) => Promise<void>
}

export function ContextSelectionModal({
  children,
  defaultType = "Quiz",
  availableFiles = [],
  onGenerate,
}: ContextSelectionModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [rangeType, setRangeType] = useState("all")
  const [customRange, setCustomRange] = useState("")
  const [focusArea, setFocusArea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLocalError(null)
    const ids = availableFiles.map((f) => f.id)
    setSelectedFiles(ids.length > 0 ? [ids[0]] : [])
  }, [open, availableFiles])

  const handleGenerate = async () => {
    setLocalError(null)
    const payload: ContextGeneratePayload = {
      type: defaultType,
      selectedFileIds: selectedFiles,
      rangeType,
      customRange,
      focusArea,
    }
    if (onGenerate) {
      setIsGenerating(true)
      try {
        await onGenerate(payload)
        setOpen(false)
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : "Generation failed")
      } finally {
        setIsGenerating(false)
      }
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="secondary">
            <Wand2 className="mr-2 size-4" /> Generate {defaultType}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Generate {defaultType}
          </DialogTitle>
          <DialogDescription>
            Select the source material and define the exact scope you want the AI to focus on for generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-4 overflow-y-auto flex-1 min-h-0">
          {availableFiles.length === 0 && (
            <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 p-3">
              No materials available yet. Upload files to this course (or your vault) first, then return here.
            </p>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                1
              </span>
              Select Source Material
            </h3>
            <div className="grid gap-2 pl-8">
              {availableFiles.map((file) => {
                const isSelected = selectedFiles.includes(file.id)
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      setSelectedFiles((prev) =>
                        prev.includes(file.id) ? prev.filter((id) => id !== file.id) : [...prev, file.id]
                      )
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`size-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>{file.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                2
              </span>
              What parts of the document?
            </h3>
            <div className="pl-8">
              <RadioGroup value={rangeType} onValueChange={setRangeType} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-pages" />
                  <Label htmlFor="all-pages">Read entire document</Label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="custom" id="custom-pages" className="mt-1" />
                    <div className="space-y-2 w-full pr-4">
                      <Label htmlFor="custom-pages" className="leading-5 block">
                        Specific Pages / Slides
                      </Label>
                      {rangeType === "custom" && (
                        <Input
                          autoFocus
                          placeholder="e.g. 1-5, 8, 11-13"
                          value={customRange}
                          onChange={(e) => setCustomRange(e.target.value)}
                          className="h-9"
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Use this to restrict generation to a specific topic or lecture section.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                3
              </span>
              Additional Instructions (Optional)
            </h3>
            <div className="pl-8">
              <Textarea
                placeholder="e.g. Focus specifically on the time complexity of the sorting algorithms..."
                className="resize-none h-20"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0 px-6 pb-6 pt-2 shrink-0 border-t mt-auto">
          {localError && <p className="text-sm text-destructive w-full sm:order-first">{localError}</p>}
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleGenerate()}
            disabled={
              selectedFiles.length === 0 ||
              (rangeType === "custom" && !customRange.trim()) ||
              isGenerating
            }
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              "Generating with Ollama… (may take a few minutes)"
            ) : (
              <>
                Continue <ChevronRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

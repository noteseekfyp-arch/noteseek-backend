"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus, Building2, CalendarDays } from "lucide-react"

interface CourseCardProps {
  title: string
  teacher: string
  university: string
  semester: string
  tag?: string
  variant?: "recommended" | "trending"
}

export default function CourseCard({
  title,
  teacher,
  university,
  semester,
  tag,
  variant = "recommended",
}: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition bg-white">
      <div className="relative h-44 bg-muted/70">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Course
        </div>
        {tag && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold tracking-wide bg-white/90 text-foreground px-2 py-1 rounded-md">
            {tag.toUpperCase()}
          </span>
        )}
        {variant === "trending" && (
          <button
            type="button"
            aria-label="Add course"
            className="absolute bottom-3 right-3 size-9 rounded-full bg-white shadow flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      <CardContent className="p-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground">{teacher}</p>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="size-4" />
            <span>{university}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            <span>{semester}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

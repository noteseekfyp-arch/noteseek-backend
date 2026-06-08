"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Building2, CalendarDays } from "lucide-react"

interface CourseCardProps {
  title: string
  teacher: string
  university: string
  semester: string
  tag?: string
  variant?: "recommended" | "trending"
  href?: string
}

export default function CourseCard({
  title,
  teacher,
  university,
  semester,
  tag,
  variant = "recommended",
  href,
}: CourseCardProps) {
  const content = (
    <Card className="overflow-hidden hover:shadow-lg transition bg-white h-full">
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
          <div
            role="button"
            aria-label="Add course"
            className="absolute bottom-3 right-3 size-9 rounded-full bg-white shadow flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Plus className="size-4" />
          </div>
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

  if (href) {
    return (
      <Link href={href} className="block w-full h-full">
        {content}
      </Link>
    )
  }

  return content;
}

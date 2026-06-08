"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, Tag } from "lucide-react"

interface TeacherCourseCardProps {
  title: string
  students: number
  updated: string
  category: string
  href: string
}

export function TeacherCourseCard({
  title,
  students,
  updated,
  category,
  href,
}: TeacherCourseCardProps) {
  return (
    <Link href={href} className="block transition-transform hover:-translate-y-1">
      <Card className="overflow-hidden hover:shadow-lg transition bg-white h-full">
        <div className="relative h-40 bg-muted/70">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Course Image
        </div>
        <span className="absolute top-3 right-3 text-[10px] font-semibold tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded-md">
          Active
        </span>
      </div>

      <CardContent className="p-5 space-y-3">
        <h3 className="text-base font-semibold leading-snug">{title}</h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            <span>{students} Students</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>Updated {updated}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide">
            <Tag className="size-3.5" />
            <span>{category}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}

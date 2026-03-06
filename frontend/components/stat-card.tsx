"use client"

import { Card, CardContent } from "@/components/ui/card"
import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon?: LucideIcon
  iconBgClassName?: string
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBgClassName = "bg-primary/10 text-primary",
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition bg-white">
      <CardContent className="p-3 flex items-center gap-3">
        {Icon && (
          <div className={`size-10 rounded-xl flex items-center justify-center ${iconBgClassName}`}>
            <Icon className="size-5" />
          </div>
        )}
        <div className="leading-tight">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
            {title}
          </p>
          <h3 className="text-xl font-bold">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

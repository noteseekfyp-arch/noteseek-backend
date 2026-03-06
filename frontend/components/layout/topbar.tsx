"use client"

import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Settings, Search } from "lucide-react"

interface TopbarProps {
  role: "student" | "teacher"
}

export default function Topbar({ role }: TopbarProps) {
  return (
    <div className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={
            role === "teacher"
              ? "Search courses, materials or students..."
              : "Search courses, notes, or tutors..."
          }
          className="h-11 rounded-full pl-11 pr-4 bg-muted/40 border-transparent focus-visible:border-ring"
        />
      </div>

      <div className="flex items-center gap-3 ml-6">
        <button
          type="button"
          className="size-10 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
        <button
          type="button"
          className="size-10 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground"
          aria-label="Settings"
        >
          <Settings className="size-4" />
        </button>

        {role === "student" ? (
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-sm font-semibold">Alex Johnson</div>
              <div className="text-xs text-muted-foreground">
                Computer Science
              </div>
            </div>
            <Avatar className="size-9">
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <Avatar className="size-9">
            <AvatarFallback>PA</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

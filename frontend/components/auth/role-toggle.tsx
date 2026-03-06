"use client"

import { User, Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type AuthRole = "student" | "teacher"

interface RoleToggleProps {
  value: AuthRole
  onChange: (role: AuthRole) => void
  /** Show person icon and checkmark on selected (register style); if false, minimal (login style) */
  showIcons?: boolean
  className?: string
}

export default function RoleToggle({
  value,
  onChange,
  showIcons = false,
  className,
}: RoleToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Select role"
      className={cn(
        "inline-flex rounded-lg border border-input bg-muted/50 p-1",
        className
      )}
    >
      {(["student", "teacher"] as const).map((role) => {
        const isSelected = value === role
        const label = role === "student" ? "Student" : "Teacher"
        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(role)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {showIcons && (
              <User
                className={cn("size-4", isSelected ? "text-primary-foreground" : "text-muted-foreground")}
              />
            )}
            {label}
            {showIcons && isSelected && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/20">
                <Check className="size-3 text-primary-foreground" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  LayoutDashboard,
  NotebookPen,
  Sparkles,
  GraduationCap,
  ClipboardList,
  Upload,
  FilePlus2,
  ClipboardCheck,
  Plus,
  User2,
} from "lucide-react"

interface SidebarProps {
  role: "student" | "teacher"
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const studentNav = [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "My Courses", icon: GraduationCap },
    { href: "/student/notes", label: "Notes", icon: NotebookPen },
    { href: "/student/ai", label: "AI Generator", icon: Sparkles },
    { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/student/quizzes", label: "Quizzes", icon: ClipboardCheck },
  ] as const

  const teacherNav = [
    { href: "/teacher", label: "My Courses", icon: GraduationCap },
    { href: "/teacher/materials", label: "Upload Material", icon: Upload },
    { href: "/teacher/assignments", label: "Create Assignment", icon: FilePlus2 },
    { href: "/teacher/quizzes", label: "Create Quiz", icon: ClipboardCheck },
    { href: "/teacher/submissions", label: "Submissions", icon: ClipboardList },
  ] as const

  return (
    <aside className="w-72 bg-white border-r flex flex-col">
      <div className="px-6 py-5 border-b">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          <div className="leading-tight">
            <div className="font-bold text-lg">NoteSeek</div>
            <div className="text-xs text-muted-foreground">Academic Platform</div>
          </div>
        </Link>
      </div>

      {role === "teacher" && (
        <div className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
              PA
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Prof. Anderson</div>
              <div className="text-xs text-muted-foreground">
                University of Science
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="px-4 flex flex-col gap-1">
        {(role === "student" ? studentNav : teacherNav).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          <User2 className="size-4" />
          Profile
        </Link>

        {role === "teacher" && (
          <button
            type="button"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
          >
            <Plus className="size-4" />
            Create New Course
          </button>
        )}
      </div>
    </aside>
  )
}

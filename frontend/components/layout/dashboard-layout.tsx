"use client"

import { ReactNode } from "react"
import Sidebar from "./sidebar"
import Topbar from "./topbar"

interface DashboardLayoutProps {
  children: ReactNode
  role: "student" | "teacher"
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 min-h-0">
        <Topbar role={role} />
        <main className="flex-1 min-h-0 p-6 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

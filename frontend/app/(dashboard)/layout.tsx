"use client"

import { usePathname } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const role = pathname?.startsWith("/teacher") ? "teacher" : "student"

  return <DashboardLayout role={role}>{children}</DashboardLayout>
}

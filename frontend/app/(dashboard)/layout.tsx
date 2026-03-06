import DashboardLayout from "@/components/layout/dashboard-layout"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporary hardcoded role
  const role: "student" | "teacher" = "student"

  return <DashboardLayout role={role}>{children}</DashboardLayout>
}

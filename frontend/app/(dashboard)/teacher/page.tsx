"use client"

import StatCard from "@/components/stat-card"
import TeacherCourseCard from "@/components/teacher-course-card"
import { Button } from "@/components/ui/button"
import {
  Users,
  BookOpenCheck,
  ClipboardList,
  Star,
  Plus,
} from "lucide-react"

export default function TeacherDashboard() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            Manage and organize your academic materials across all departments.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Filter</Button>
          <Button>
            <Plus className="mr-2 size-4" />
            New Course
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value="183"
          icon={Users}
        />
        <StatCard
          title="Active Courses"
          value="8"
          icon={BookOpenCheck}
          iconBgClassName="bg-emerald-50 text-emerald-500"
        />
        <StatCard
          title="Pending Submissions"
          value="42"
          icon={ClipboardList}
          iconBgClassName="bg-amber-50 text-amber-500"
        />
        <StatCard
          title="Avg. Performance"
          value="88%"
          icon={Star}
          iconBgClassName="bg-violet-50 text-violet-500"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-4 gap-6 items-stretch">
        <TeacherCourseCard
          title="Advanced Mathematics"
          students={32}
          updated="2h ago"
          category="Calculus"
        />

        <TeacherCourseCard
          title="Quantum Physics"
          students={28}
          updated="1d ago"
          category="Theoretical"
        />

        <TeacherCourseCard
          title="Linear Algebra"
          students={45}
          updated="3d ago"
          category="Math"
        />

        <TeacherCourseCard
          title="Intro to Calculus"
          students={50}
          updated="5d ago"
          category="General"
        />

        {/* Add New Course Card */}
        <div className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-64 bg-muted/40 hover:bg-muted/60 transition cursor-pointer">
          <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm text-primary mb-3">
            <Plus className="size-5" />
          </div>
          <p className="font-semibold">Add New Course</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-[14rem] text-center">
            Expand your curriculum by creating a new academic space.
          </p>
        </div>
      </div>
    </div>
  )
}

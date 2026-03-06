"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/api"
import {
  Share2,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react"

import AuthHeader from "@/components/auth/auth-header"
import RoleToggle, { type AuthRole } from "@/components/auth/role-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<AuthRole>("student")
  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [university, setUniversity] = useState("")
  const [department, setDepartment] = useState("")
  const [semester, setSemester] = useState("")

  async function handleRegister(e: any) {
    e.preventDefault()

    try {
      await registerUser({
        email,
        password,
        name,
        role,
        university,
        department,
        semester,
      })

      router.push("/login")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <AuthHeader
        navLinks={[
          { label: "About", href: "#" },
          { label: "Resources", href: "#" },
          { label: "Support", href: "#" },
        ]}
        ctaLabel="Log In"
        ctaHref="/login"
        ctaPrompt="Already have an account?"
      />

      <main className="flex-1 flex min-h-0">
        {/* Left: Marketing */}
        <section className="hidden lg:flex flex-col justify-center w-[40%] max-w-xl px-12 xl:px-16 py-12">
          <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            Academic Excellence
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground">
            Elevate your{" "}
            <span className="text-primary">
              learning experience with the community.
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join over 50,000 students and teachers sharing knowledge, notes, and
            collaborative research tools across the globe.
          </p>

          <ul className="mt-8 space-y-6">
            <li className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Share2 className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">Collaborative Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time editing and feedback on academic materials.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">Verified Institutions</h3>
                <p className="text-sm text-muted-foreground">
                  Connect specifically with peers from your university.
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-10 rounded-xl bg-primary p-6 text-primary-foreground">
            <p className="text-sm leading-relaxed">
              &ldquo;NoteSeek changed how our study group functions. It&apos;s the
              central hub for everything we learn.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="size-10 border-2 border-primary-foreground/20">
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Jane Doe</p>
                <p className="text-xs text-primary-foreground/80">
                  Senior Resident, Stanford Medical
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Form */}
        <section className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:pl-16 lg:pr-24 xl:pl-24 overflow-y-auto">
          <div className="w-full max-w-md mx-auto lg:mx-0 space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="mt-1 text-muted-foreground">
                Fill in the details below to start your academic journey.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select your role</Label>
              <RoleToggle
                value={role}
                onChange={setRole}
                showIcons={true}
              />
            </div>

            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email Address</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-university">University / Institution</Label>
                <Select id="reg-university" value={university} onChange={(e: any) => setUniversity(e.target.value)}>
                  <option value="">Select your university</option>
                  <option value="stanford">Stanford University</option>
                  <option value="mit">MIT</option>
                  <option value="harvard">Harvard</option>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="reg-department">Department</Label>
                  <Input
                    id="reg-department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-semester">Semester / Level</Label>
                  <Select id="reg-semester" value={semester} onChange={(e: any) => setSemester(e.target.value)}>
                    <option value="">Choose semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirm Password</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="reg-terms" className="mt-0.5" />
                <Label
                  htmlFor="reg-terms"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  I agree to the{" "}
                  <Link href="#" className="text-primary underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary underline">
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
              >
                Create Academic Account
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}

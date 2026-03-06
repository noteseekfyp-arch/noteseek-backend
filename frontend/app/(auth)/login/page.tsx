"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, Eye, EyeOff } from "lucide-react"

import { loginUser } from "@/lib/api"
import { saveToken } from "@/lib/auth"
import AuthHeader from "@/components/auth/auth-header"
import RoleToggle, { type AuthRole } from "@/components/auth/role-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<AuthRole>("student")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin() {
    try {
      setLoading(true)
      setError("")

      const data = await loginUser(email, password)

      saveToken(data.access_token)

      if (role === "student") {
        router.push("/student")
      } else {
        router.push("/teacher")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthHeader
        navLinks={[
          { label: "Features", href: "#" },
          { label: "About", href: "#" },
          { label: "Support", href: "#" },
        ]}
        ctaLabel="Sign Up"
        ctaHref="/register"
      />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md rounded-2xl shadow-lg border bg-card">
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="size-6" />
              </span>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Log in to access your academic collaboration workspace.
              </p>
            </div>

            <RoleToggle value={role} onChange={setRole} showIcons={false} />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="pl-9 pr-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-9 pr-9"
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

              <div className="flex items-center gap-2">
                <Checkbox id="login-remember" />
                <Label
                  htmlFor="login-remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember this device
                </Label>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
            <Button
              className="w-full"
              size="lg"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-background">
        © 2024 NoteSeek. Secure academic collaboration environment.
      </footer>
    </>
  )
}

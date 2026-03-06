"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AuthHeaderProps {
  /** Nav links: e.g. ["Features", "About", "Support"] or ["About", "Resources", "Support"] */
  navLinks: { label: string; href: string }[]
  /** Right-side CTA: e.g. "Sign Up" or "Log In" */
  ctaLabel: string
  ctaHref: string
  /** Optional: text before CTA, e.g. "Already have an account?" */
  ctaPrompt?: string
  className?: string
}

export default function AuthHeader({
  navLinks,
  ctaLabel,
  ctaHref,
  ctaPrompt,
  className,
}: AuthHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between px-6 py-4 border-b border-border bg-background",
        className
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-foreground font-bold text-lg"
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BookOpen className="size-5" />
        </span>
        NoteSeek
      </Link>

      <nav className="flex items-center gap-8">
        {navLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {label}
          </Link>
        ))}
        <div className="flex items-center gap-2">
          {ctaPrompt && (
            <span className="text-sm text-muted-foreground">{ctaPrompt}</span>
          )}
          <Button variant={ctaPrompt ? "outline" : "default"} asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

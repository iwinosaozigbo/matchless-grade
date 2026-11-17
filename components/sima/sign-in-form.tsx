"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AtSign, LoaderCircle, LockKeyhole } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function SimaSignInForm({
  paymentConfirmed,
  nextPath,
}: {
  paymentConfirmed: boolean
  nextPath: "/admin" | "/learn" | "/learn?purchase=sima-abacus"
}) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    const normalizedIdentifier = identifier.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)

    if (isEmail) {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedIdentifier.toLowerCase(),
        password,
      })

      if (signInError) {
        setError("Invalid username/email or password. Check your details or use Forgot password to reset your password.")
        setSubmitting(false)
        return
      }
    } else {
      try {
        const response = await fetch("/api/sima-abacus/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: normalizedIdentifier, password }),
        })
        const result = (await response.json().catch(() => ({}))) as { error?: string }
        if (!response.ok) {
          setError(result.error || "Unable to sign in right now. Please try again.")
          setSubmitting(false)
          return
        }
      } catch {
        setError("Unable to sign in right now. Please try again.")
        setSubmitting(false)
        return
      }
    }

    router.replace(nextPath)
    router.refresh()
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background bg-dots px-5 py-10 text-foreground">
      <Card className="w-full max-w-md rounded-[2rem] border-2 border-brand/15 shadow-soft">
        <CardHeader className="gap-2 text-center">
          <Link href="/" className="mx-auto font-display text-sm font-bold text-muted-foreground">Matchless <span className="text-brand">Grade</span></Link>
          <CardTitle className="font-display text-3xl">Welcome back</CardTitle>
          <CardDescription>
            {nextPath === "/admin"
              ? "Sign in with the administrator email and its existing account password."
              : "Sign in with your username or account email to open your courses and learning progress."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {paymentConfirmed && (
            <p role="status" className="rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-sm leading-relaxed">
              Payment confirmed. Sign in with your account to see your available courses in Learn.
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Username or email address
              <span className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-3 focus-within:ring-2 focus-within:ring-ring/40">
                <AtSign className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  aria-label="Username or email address"
                />
              </span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Password
              <span className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-3 focus-within:ring-2 focus-within:ring-ring/40">
                <LockKeyhole className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  aria-label="Password"
                />
              </span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
            <Link
              href={nextPath === "/admin" ? "/forgot-password?next=%2Fadmin" : "/forgot-password?next=%2Flearn"}
              className="self-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
              {submitting && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New to Matchless Grade?{" "}
            <Link href="/signup" className="font-bold text-brand underline-offset-4 hover:underline">Create an account</Link>
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "w-full rounded-full")}>Back to Matchless Grade</Link>
        </CardContent>
      </Card>
    </main>
  )
}

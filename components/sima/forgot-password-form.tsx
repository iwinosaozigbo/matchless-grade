"use client"

import { useState } from "react"
import Link from "next/link"
import { AtSign, LoaderCircle, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export function ForgotPasswordForm({ nextPath }: { nextPath: "/admin" | "/learn" }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setStatus("")

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid account email address.")
      return
    }

    setSending(true)
    try {
      const redirectTo = new URL(
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
      )
      redirectTo.searchParams.set("next", `/reset-password?next=${encodeURIComponent(nextPath)}`)

      const { error: resetError } = await createClient().auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: redirectTo.toString(),
      })

      if (resetError) {
        setError("Unable to send a reset link right now. Please wait a moment and try again.")
      } else {
        setStatus("If an account exists for this email, a secure password reset link has been sent.")
      }
    } catch {
      setError("Unable to send a reset link right now. Please wait a moment and try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background bg-dots px-5 py-10 text-foreground">
      <Card className="w-full max-w-md rounded-[2rem] border-2 border-brand/15 shadow-soft">
        <CardHeader className="gap-2 text-center">
          <Link href="/" className="mx-auto font-display text-sm font-bold text-muted-foreground">
            Matchless <span className="text-brand">Grade</span>
          </Link>
          <CardTitle className="font-display text-3xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the email address on the parent or learner account. We&apos;ll email a secure link to create a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Account email address
              <span className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-3 focus-within:ring-2 focus-within:ring-ring/40">
                <AtSign className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  aria-label="Account email address"
                />
              </span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
            {status && <p role="status" className="rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-sm leading-relaxed">{status}</p>}
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={sending}>
              {sending && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
              {sending ? "Sending reset link…" : "Email me a reset link"}
            </Button>
          </form>
          <Link
            href={nextPath === "/admin" ? "/login?next=%2Fadmin" : "/login"}
            className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <LockKeyhole className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

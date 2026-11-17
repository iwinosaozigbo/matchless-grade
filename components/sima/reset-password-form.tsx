"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export function SimaResetPasswordForm({ nextPath }: { nextPath: "/admin" | "/learn" }) {
  const router = useRouter()
  const minLength = nextPath === "/admin" ? 12 : 8
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (password.length < minLength) {
      setError(`Choose a password with at least ${minLength} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password })

      if (updateError) {
        setError("This reset link may have expired. Request a new password reset link and try again.")
        setSubmitting(false)
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch {
      setError("This reset link may have expired. Request a new password reset link and try again.")
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background bg-dots px-5 py-10 text-foreground">
      <Card className="w-full max-w-md rounded-[2rem] border-2 border-brand/15 shadow-soft">
        <CardHeader className="gap-2 text-center">
          <CardTitle className="font-display text-3xl">Set a new password</CardTitle>
          <CardDescription>Use at least {minLength} characters and keep it unique to this account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              New password
              <span className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-3 focus-within:ring-2 focus-within:ring-ring/40">
                <LockKeyhole className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={minLength}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  aria-label="New password"
                />
              </span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Confirm new password
              <span className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-3 focus-within:ring-2 focus-within:ring-ring/40">
                <LockKeyhole className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={minLength}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  aria-label="Confirm new password"
                />
              </span>
            </label>
            {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
              {submitting && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
              {submitting ? "Updating password…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

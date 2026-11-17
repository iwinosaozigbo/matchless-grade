"use client"

import Link from "next/link"
import { useState } from "react"
import { LogOut, Send } from "lucide-react"
import { useGame } from "@/lib/game-store"
import { FloatingShapes } from "@/components/floating-shapes"

export function AppShell({ children, xp = 0, accountName }: { children: React.ReactNode; xp?: number; accountName?: string }) {
  const { logout } = useGame()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)
    setSignOutError(null)
    try {
      await logout()
      // A full navigation drops cached authenticated routes after the session cookies are cleared.
      window.location.replace("/login")
    } catch {
      setSignOutError("Unable to sign out. Please try again.")
      setIsSigningOut(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background bg-dots">
      <FloatingShapes count={8} />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/learn" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Send className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold">
              Matchless <span className="text-brand">Grade</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {accountName && <span className="hidden max-w-40 truncate text-sm font-semibold text-muted-foreground sm:block">{accountName}</span>}
            <div className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5">
              <span className="font-display text-sm font-bold text-brand">{xp}</span>
              <span className="text-xs font-semibold text-muted-foreground">XP</span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              aria-label={isSigningOut ? "Signing out" : "Log out"}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:cursor-wait disabled:opacity-50"
              title={isSigningOut ? "Signing out…" : accountName ? `Log out ${accountName}` : "Log out"}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
        {signOutError && (
          <p role="alert" className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {signOutError}
          </p>
        )}
        {children}
      </main>
    </div>
  )
}

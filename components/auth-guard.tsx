"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useGame } from "@/lib/game-store"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, isAuthed, hasAccess } = useGame()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!isAuthed) router.replace("/login")
    else if (!hasAccess) router.replace("/signup")
  }, [ready, isAuthed, hasAccess, router])

  if (!ready || !isAuthed || !hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-float text-5xl">🚀</div>
      </div>
    )
  }

  return <>{children}</>
}

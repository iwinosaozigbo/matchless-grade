"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, X } from "lucide-react"
import { formatNgn, getProgram, isEarlyBird } from "@/lib/program-pricing"

const SEEN_KEY = "mg-earlybird-popup-seen"

export function EarlyBirdPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isEarlyBird()) return
    if (sessionStorage.getItem(SEEN_KEY)) return
    const timer = setTimeout(() => setOpen(true), 1400)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setOpen(false)
    try {
      sessionStorage.setItem(SEEN_KEY, "1")
    } catch {
      /* ignore storage errors */
    }
  }

  if (!open) return null

  const mathematics = getProgram("mathematics")!
  const earlyBird = formatNgn(mathematics.earlyBirdPriceNgn)
  const launch = formatNgn(mathematics.launchPriceNgn)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="earlybird-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        aria-label="Close"
        onClick={dismiss}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm animate-agefade"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border-2 border-border bg-card p-7 text-card-foreground shadow-soft animate-pop">
        <button
          onClick={dismiss}
          aria-label="Close popup"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 font-display text-xs font-bold text-sun-foreground shadow-toy-sun">
          <Sparkles className="h-3.5 w-3.5" />
          Early-bird registration is open
        </span>

        <h2 id="earlybird-title" className="mt-4 text-balance font-display text-3xl font-bold leading-tight">
          Mathematics for <span className="font-sans text-brand">{earlyBird}</span>/month
        </h2>
        <p className="mt-3 text-pretty text-base text-muted-foreground">
          The full Mathematics bundle — Upper Basic, Junior &amp; Senior Secondary — is ready. Register now and lock in
          the early-bird rate before it jumps to <span className="font-bold text-foreground">{launch}/month</span> at
          launch. Billed as a monthly recurring payment.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/signup?product=mathematics"
            onClick={dismiss}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-sun px-6 py-4 font-display text-lg font-bold text-sun-foreground shadow-toy-sun transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Claim early-bird price
            <ArrowRight className="h-5 w-5" />
          </Link>
          <button
            onClick={dismiss}
            className="text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

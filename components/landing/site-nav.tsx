"use client"

import Link from "next/link"
import Image from "next/image"
import { PillLink } from "@/components/pill-button"

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <Image
            src="/matchless-grade-logo.png"
            alt=""
            width={44}
            height={44}
            className="h-10 w-10 shrink-0 object-contain"
            priority
          />
          <span className="font-display text-xl font-bold">
            Matchless <span className="text-brand">Grade</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
          <Link href="/#subjects" className="transition-colors hover:text-foreground">
            Programmes
          </Link>
          <Link href="/#how" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link href="/learn" className="font-bold text-brand transition-colors hover:text-foreground">
            Learn
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/learn" className="text-sm font-bold text-brand transition-colors hover:text-foreground md:hidden">
            Learn
          </Link>
          <PillLink href="/login" variant="sun" size="sm">
            Sign in
          </PillLink>
        </div>
      </nav>
    </header>
  )
}

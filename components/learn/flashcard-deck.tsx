"use client"

import { useState } from "react"
import { Check, ChevronLeft, ChevronRight, RotateCw, Sparkles } from "lucide-react"
import type { Flashcard } from "@/lib/lessons-data"
import { cn } from "@/lib/utils"

export function FlashcardDeck({
  cards,
  onComplete,
}: {
  cards: Flashcard[]
  onComplete: (reviewed: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [seen, setSeen] = useState<Set<number>>(new Set([0]))
  const [done, setDone] = useState(false)

  const card = cards[index]
  const allSeen = seen.size === cards.length

  function go(next: number) {
    if (next < 0 || next >= cards.length) return
    setFlipped(false)
    setIndex(next)
    setSeen((s) => new Set(s).add(next))
  }

  function finish() {
    if (done) return
    setDone(true)
    onComplete(cards.length)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full items-center justify-between text-sm">
        <span className="font-display font-bold">
          Card {index + 1} / {cards.length}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-bold text-mint">
          <Sparkles className="h-3.5 w-3.5" /> +5 XP each
        </span>
      </div>

      {/* Flip card */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="group relative h-64 w-full max-w-lg [perspective:1200px]"
        aria-label="Flip flashcard"
      >
        <div
          className={cn(
            "relative h-full w-full rounded-[2rem] transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-border bg-card p-6 text-center shadow-toy [backface-visibility:hidden]">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">QUESTION</span>
            <p className="text-balance font-display text-xl font-bold sm:text-2xl">{card.front}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" /> Tap to flip
            </span>
          </div>
          {/* Back */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-brand bg-brand p-6 text-center text-brand-foreground shadow-toy [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">ANSWER</span>
            <p className="text-balance font-display text-xl font-bold sm:text-2xl">{card.back}</p>
          </div>
        </div>
      </button>

      {/* Controls */}
      <div className="flex w-full max-w-lg items-center justify-between gap-3">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card text-foreground transition-colors hover:border-brand disabled:opacity-40"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-1 items-center justify-center gap-1.5">
          {cards.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-brand" : seen.has(i) ? "w-2 bg-brand/40" : "w-2 bg-secondary",
              )}
            />
          ))}
        </div>

        <button
          onClick={() => go(index + 1)}
          disabled={index === cards.length - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-card text-foreground transition-colors hover:border-brand disabled:opacity-40"
          aria-label="Next card"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {allSeen && !done && (
        <button
          onClick={finish}
          className="flex items-center gap-2 rounded-full bg-mint px-6 py-3 font-display font-bold text-white shadow-toy transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Check className="h-5 w-5" /> Collect {cards.length * 5} XP
        </button>
      )}
      {done && (
        <p className="animate-pop inline-flex items-center gap-2 rounded-full bg-mint/15 px-4 py-2 font-display font-bold text-mint">
          <Check className="h-5 w-5" /> Nice! Flashcards reviewed.
        </p>
      )}
    </div>
  )
}

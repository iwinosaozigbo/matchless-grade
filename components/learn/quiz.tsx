"use client"

import { useState } from "react"
import { Check, RotateCcw, Trophy, X, Zap } from "lucide-react"
import type { QuizQuestion } from "@/lib/lessons-data"
import { cn } from "@/lib/utils"

export function Quiz({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[]
  onComplete: (correct: number, total: number) => void
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[current]
  const isLast = current === questions.length - 1

  function choose(i: number) {
    if (locked) return
    setSelected(i)
    setLocked(true)
    if (i === q.answer) setCorrect((c) => c + 1)
  }

  function next() {
    if (isLast) {
      setFinished(true)
      onComplete(selected === q.answer || selected === null ? correct : correct, questions.length)
      return
    }
    setCurrent((c) => c + 1)
    setSelected(null)
    setLocked(false)
  }

  function restart() {
    setCurrent(0)
    setSelected(null)
    setLocked(false)
    setCorrect(0)
    setFinished(false)
  }

  if (finished) {
    const perfect = correct === questions.length
    const pct = Math.round((correct / questions.length) * 100)
    return (
      <div className="animate-pop flex flex-col items-center gap-4 rounded-[2rem] border-2 border-border bg-card p-8 text-center shadow-toy">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full text-white",
            perfect ? "bg-sun text-sun-foreground" : pct >= 50 ? "bg-mint" : "bg-bubblegum",
          )}
        >
          <Trophy className="h-10 w-10" />
        </div>
        <h3 className="font-display text-2xl font-bold">
          {perfect ? "Perfect score!" : pct >= 50 ? "Well done!" : "Good try!"}
        </h3>
        <p className="text-muted-foreground">
          You got <span className="font-bold text-foreground">{correct}</span> of {questions.length} correct.
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun/15 px-4 py-2 font-display font-bold text-sun-foreground">
          <Zap className="h-4 w-4 text-sun" /> +{correct * 15} XP earned
        </span>
        <button
          onClick={restart}
          className="mt-1 inline-flex items-center gap-2 rounded-full border-2 border-border px-5 py-2.5 font-display font-bold transition-colors hover:border-brand"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-toy sm:p-6">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-display font-bold">
          Question {current + 1} / {questions.length}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sun/15 px-2.5 py-1 text-xs font-bold text-sun-foreground">
          <Zap className="h-3.5 w-3.5 text-sun" /> +15 XP correct
        </span>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${((current + (locked ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <p className="mb-5 text-balance font-display text-xl font-bold sm:text-2xl">{q.question}</p>

      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer
          const isChosen = i === selected
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={locked}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-semibold transition-all",
                !locked && "border-border bg-background hover:border-brand hover:bg-brand/5",
                locked && isAnswer && "border-mint bg-mint/10 text-foreground",
                locked && isChosen && !isAnswer && "border-destructive bg-destructive/10",
                locked && !isChosen && !isAnswer && "border-border bg-background opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  locked && isAnswer
                    ? "bg-mint text-white"
                    : locked && isChosen
                      ? "bg-destructive text-white"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {locked && isAnswer ? (
                  <Check className="h-4 w-4" />
                ) : locked && isChosen ? (
                  <X className="h-4 w-4" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {locked && (
        <div className="animate-pop mt-4 rounded-2xl bg-secondary/60 p-4">
          <p className="text-sm">
            <span className="font-display font-bold">
              {selected === q.answer ? "Correct! " : "Not quite. "}
            </span>
            {q.explanation}
          </p>
          <button
            onClick={next}
            className="mt-3 w-full rounded-full bg-brand py-3 font-display font-bold text-brand-foreground shadow-toy-brand transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLast ? "See results" : "Next question"}
          </button>
        </div>
      )}
    </div>
  )
}

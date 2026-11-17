"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, LoaderCircle, RotateCcw, Trophy, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { PublicSimaQuizQuestion } from "@/lib/sima/quiz"

type QuizReview = {
  correctIndex: number
  explanation: string
  isCorrect: boolean
}

type QuizResult = {
  correct: number
  total: number
  score: number
  passed: boolean
  xpEarned: number
  xpTotal: number
  bestScore: number
  review: QuizReview[]
}

export function SimaQuiz({ lessonId, questions, course = "sima-abacus" }: { lessonId: string; questions: PublicSimaQuizQuestion[]; course?: "sima-abacus" | "math" }) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>(() => Array(questions.length).fill(-1))
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const question = questions[current]
  const selected = answers[current]
  const progressValue = Math.round(((current + 1) / questions.length) * 100)

  async function finishQuiz() {
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/${course}/lessons/${encodeURIComponent(lessonId)}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Your quiz could not be saved. Please try again.")
        return
      }
      setResult(data as QuizResult)
      router.refresh()
    } catch {
      setError("Your quiz could not be saved. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function chooseAnswer(optionIndex: number) {
    setAnswers((currentAnswers) => currentAnswers.map((answer, index) => index === current ? optionIndex : answer))
  }

  function restart() {
    setCurrent(0)
    setAnswers(Array(questions.length).fill(-1))
    setResult(null)
    setError("")
  }

  if (result) {
    return (
      <Card className="rounded-3xl border-2 border-brand/15 shadow-soft">
        <CardHeader className="items-center text-center">
          <span className={cn("flex size-16 items-center justify-center rounded-full", result.passed ? "bg-sun/25 text-sun-foreground" : "bg-secondary text-secondary-foreground")}>
            <Trophy className="size-8" aria-hidden="true" />
          </span>
          <CardTitle className="font-display text-2xl">{result.passed ? "Great work!" : "Keep practising"}</CardTitle>
          <CardDescription>You got {result.correct} of {result.total} correct ({result.score}%).</CardDescription>
          <Badge variant="secondary" className="rounded-full px-3 py-1">+{result.xpEarned} XP · {result.xpTotal} total</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {result.review.map((item, index) => (
            <div key={questions[index].id} className="rounded-2xl border border-border p-4">
              <p className="font-display font-bold">{index + 1}. {questions[index].question}</p>
              <p className={cn("mt-2 flex items-start gap-2 text-sm font-semibold", item.isCorrect ? "text-foreground" : "text-destructive")}>
                {item.isCorrect ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
                Your answer: {questions[index].options[answers[index]]}
              </p>
              {!item.isCorrect && <p className="mt-1 text-sm text-muted-foreground">Correct answer: {questions[index].options[item.correctIndex]}</p>}
              <p className="mt-2 text-sm text-muted-foreground">{item.explanation}</p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" size="lg" className="w-full rounded-full" onClick={restart}>
            <RotateCcw data-icon="inline-start" /> Try again
          </Button>
          <Link href="/learn" className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full")}>Back to course</Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl border-2 border-brand/15">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-display text-xl">Quick practice</CardTitle>
          <Badge variant="outline" className="rounded-full">Question {current + 1} of {questions.length}</Badge>
        </div>
        <Progress value={progressValue} aria-label={`Quiz progress: ${progressValue}%`} className="h-2" />
        <CardDescription>Choose one answer for each question. Pass with at least two correct answers to earn XP.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-balance font-display text-lg font-bold sm:text-xl">{question.question}</p>
        <div role="group" aria-label="Answer choices" className="flex flex-col gap-2.5">
          {question.options.map((option, index) => (
            <Button
              key={`${question.id}-${index}`}
              type="button"
              variant={selected === index ? "secondary" : "outline"}
              aria-pressed={selected === index}
              className={cn("h-auto min-h-12 w-full justify-start whitespace-normal rounded-2xl px-4 py-3 text-left", selected === index && "border-brand/50")}
              onClick={() => chooseAnswer(index)}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="whitespace-normal">{option}</span>
            </Button>
          ))}
        </div>
        {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        {current > 0 ? (
          <Button type="button" variant="ghost" className="w-full rounded-full sm:w-auto" onClick={() => setCurrent((step) => step - 1)} disabled={submitting}>Previous</Button>
        ) : <span className="hidden sm:block" />}
        {current < questions.length - 1 ? (
          <Button type="button" size="lg" className="w-full rounded-full sm:w-auto" onClick={() => setCurrent((step) => step + 1)} disabled={selected < 0 || submitting}>Next question</Button>
        ) : (
          <Button type="button" size="lg" className="w-full rounded-full sm:w-auto" onClick={finishQuiz} disabled={selected < 0 || submitting}>
            {submitting ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Trophy data-icon="inline-start" />}
            {submitting ? "Saving score…" : "Submit quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

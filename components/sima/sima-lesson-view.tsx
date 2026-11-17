import Link from "next/link"
import { ArrowLeft, BookOpenCheck, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SimaQuiz } from "@/components/sima/sima-quiz"
import type { PublicSimaQuizQuestion } from "@/lib/sima/quiz"
import type { SimaCourseProgress } from "@/components/sima/course-dashboard"

export type SimaLessonViewData = {
  id: string
  week_number: number
  lesson_number: number
  title: string
  summary: string
  video_url: string
}

export function SimaLessonView({
  lesson,
  questions,
  course = "sima-abacus",
  progress,
}: {
  lesson: SimaLessonViewData
  questions: PublicSimaQuizQuestion[]
  course?: "sima-abacus" | "math"
  progress?: SimaCourseProgress
}) {
  const embedUrl = getYouTubeEmbedUrl(lesson.video_url)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/learn" className="font-display text-lg font-bold">Matchless <span className="text-brand">Grade</span></Link>
        <Link href="/learn" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}>
          <ArrowLeft data-icon="inline-start" /> All my courses
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit rounded-full">{course === "math" ? "MATHEMATICS" : "SIMA ABACUS"} · WEEK {lesson.week_number} · VIDEO {lesson.lesson_number}</Badge>
        {progress && <p className="text-sm font-semibold text-muted-foreground">{progress.completed_at ? "Complete" : "In progress"} · Best quiz score {progress.best_score}% · {progress.xp_awarded} XP saved</p>}
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{lesson.title}</h1>
        <p className="max-w-3xl leading-relaxed text-muted-foreground">{lesson.summary}</p>
      </section>

      <Card className="overflow-hidden rounded-3xl border-2 border-brand/15 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl"><Play className="size-5 text-brand" aria-hidden="true" /> Lesson video</CardTitle>
          <CardDescription>Watch the lesson, then complete the practice quiz below.</CardDescription>
        </CardHeader>
        <CardContent>
          {embedUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl bg-ink">
              <iframe
                src={embedUrl}
                title={`${lesson.title} — ${course === "math" ? "Mathematics" : "SIMA Abacus"} lesson video`}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : (
            <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-muted p-6 text-center">
              <BookOpenCheck className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-semibold">This lesson video is temporarily unavailable.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <section aria-label="Lesson quiz">
        <SimaQuiz lessonId={lesson.id} questions={questions} course={course} />
      </section>
    </div>
  )
}

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const videoId = host === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com"
        ? url.searchParams.get("v")
        : null

    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
  } catch {
    return null
  }
}

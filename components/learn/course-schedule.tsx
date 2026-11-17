import Link from "next/link"
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, LockKeyhole, Sparkles, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SimaCourseLesson, SimaCourseProgress } from "@/components/sima/course-dashboard"
import type { MathLiveClassLink } from "@/lib/math-lessons"
import { cn } from "@/lib/utils"

export function CourseSchedule({ lessons, progress, title, course, liveClassLink }: {
  lessons: SimaCourseLesson[]
  progress: SimaCourseProgress[]
  title: string
  course: "math" | "abacus"
  liveClassLink?: MathLiveClassLink
}) {
  const progressByLesson = new Map(progress.map((item) => [item.lesson_id, item]))
  const completedCount = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.completed_at).length
  const totalXp = lessons.reduce((sum, lesson) => sum + (progressByLesson.get(lesson.id)?.xp_awarded ?? 0), 0)
  const completion = lessons.length ? Math.round(completedCount / lessons.length * 100) : 0
  const groups = Array.from(lessons.reduce((map, lesson) => {
    map.set(lesson.week_number, [...(map.get(lesson.week_number) ?? []), lesson])
    return map
  }, new Map<number, SimaCourseLesson[]>()).entries()).sort(([weekA], [weekB]) => weekA - weekB)

  return (
    <section aria-label={`${title} weekly learning path`} className="flex flex-col gap-5">
      <Card className="rounded-3xl border-2 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-brand" aria-hidden="true" /> {title} progress</CardTitle>
          <CardDescription>{course === "math" ? "Two recorded videos are released each week, with one weekly live Q&A and problem-solving class for each group." : "Four videos per week."} Watch each video, then pass its short quiz. Earlier weeks stay open.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold">{totalXp} XP</span>
            <span className="text-sm text-muted-foreground">{completedCount} / {lessons.length} complete · {completion}%</span>
          </div>
          <Progress value={completion} aria-label={`${title} completion: ${completion}%`} className="h-2.5" />
          <p className="text-xs text-muted-foreground">Scores, completed lessons and XP are saved to your account.</p>
        </CardContent>
      </Card>

      {course === "math" && liveClassLink && (
        <Card className="rounded-3xl border-2 border-brand/20 bg-brand/5 shadow-none">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Video className="size-5" aria-hidden="true" /></span>
                <div>
                  <CardTitle className="text-lg">Weekly live class</CardTitle>
                  <CardDescription>{title} · live Q&amp;A and problem-solving</CardDescription>
                </div>
              </div>
              {liveClassLink.scheduleInfo && <p className="mt-3 text-sm font-medium text-foreground">{liveClassLink.scheduleInfo}</p>}
            </div>
            <a href={liveClassLink.joinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Join class <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </CardContent>
        </Card>
      )}

      {lessons.length === 0 && <p className="text-sm text-muted-foreground">Your lesson timetable will appear here when classes are published.</p>}
      {groups.map(([weekNumber, weekLessons]) => {
        const unlocked = weekLessons.some((lesson) => lesson.unlocked)
        const releaseDate = new Intl.DateTimeFormat("en-NG", {
          weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos",
        }).format(new Date(weekLessons[0].release_at))
        const completedInWeek = weekLessons.filter((lesson) => progressByLesson.get(lesson.id)?.completed_at).length

        return (
          <details key={weekNumber} open={unlocked} className={cn("group/week overflow-hidden rounded-3xl border-2 bg-card", unlocked ? "border-brand/20" : "border-border")}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold">Week {weekNumber}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{unlocked ? `Released ${releaseDate}` : `Opens ${releaseDate} · 12:00 AM Lagos time`}</span>
              </span>
              <Badge variant={unlocked ? "secondary" : "outline"} className="rounded-full">{unlocked ? `${completedInWeek}/${weekLessons.length} complete` : `${weekLessons.length} scheduled`}</Badge>
              <ChevronDown className="size-4 shrink-0 transition-transform group-open/week:rotate-180" aria-hidden="true" />
            </summary>
            <div className="flex flex-col gap-3 border-t border-border p-3 sm:p-4">
              {weekLessons.map((lesson) => {
                const result = progressByLesson.get(lesson.id)
                const completed = Boolean(result?.completed_at)
                const LessonIcon = !lesson.unlocked ? LockKeyhole : completed ? CheckCircle2 : ArrowRight
                const content = (
                  <>
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", lesson.unlocked ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground")}><LessonIcon className="size-5" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-semibold text-muted-foreground">Video {lesson.lesson_number} · {lesson.xp_reward} XP</span>
                      <span className="block text-pretty font-display font-bold">{lesson.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{lesson.summary}</span>
                      {result && <span className="mt-2 block text-xs font-semibold text-muted-foreground">Best quiz score {result.best_score}% · {result.xp_awarded} XP</span>}
                      {completed && <Badge variant="secondary" className="mt-2 rounded-full">Complete</Badge>}
                    </span>
                    {lesson.unlocked && <ArrowRight className="mt-3 size-4 shrink-0 text-brand" aria-hidden="true" />}
                  </>
                )
                return lesson.unlocked ? (
                  <Link key={lesson.id} href={`/learn/${course}/${lesson.id}`} className="flex items-start gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-brand/50 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{content}</Link>
                ) : (
                  <div key={lesson.id} aria-disabled="true" className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">{content}</div>
                )
              })}
            </div>
          </details>
        )
      })}
    </section>
  )
}

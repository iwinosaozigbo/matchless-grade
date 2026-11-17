import Image from "next/image"
import { BookOpen, ChevronDown, GraduationCap, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseSchedule } from "@/components/learn/course-schedule"
import type { MathCourseLesson, MathLiveClassLink } from "@/lib/math-lessons"
import type { SimaCourseProgress } from "@/components/sima/course-dashboard"

export function LearnDashboard({ lessons, progress, name, liveClassLinks = [], simaCompleted = 0, simaLessonCount = 0, simaXp = 0 }: {
  lessons: MathCourseLesson[]
  progress: SimaCourseProgress[]
  name: string
  liveClassLinks?: MathLiveClassLink[]
  simaCompleted?: number
  simaLessonCount?: number
  simaXp?: number
}) {
  const stages = ["Nursery 2 & Basic 1", "Basic 2-3", "Upper Basic", "Junior Secondary", "Senior Secondary"].filter((stage) => lessons.some((lesson) => lesson.stage === stage))
  const englishStages = [...new Set(lessons.filter((lesson) => lesson.stage.endsWith("English")).map((lesson) => lesson.stage))]
  const done = progress.filter((item) => item.completed_at).length + simaCompleted
  const xp = progress.reduce((sum, item) => sum + item.xp_awarded, 0) + simaXp

  return (
    <div className="flex flex-col gap-7">
      <Card className="rounded-[2rem] border-2 shadow-soft">
        <CardHeader>
          <Badge variant="secondary" className="w-fit rounded-full"><Sparkles data-icon="inline-start" /> Your learning space</Badge>
          <h1 data-slot="card-title" className="mt-2 text-balance font-display text-3xl font-bold sm:text-4xl">Welcome back, {name}!</h1>
          <CardDescription>Choose a course below. Videos open on the weekly timetable, with practice questions and progress saved to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge variant="outline" className="rounded-full px-3 py-1.5">{xp} earned XP</Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1.5">{done} / {lessons.length + simaLessonCount} lessons complete</Badge>
        </CardContent>
      </Card>

      <section aria-labelledby="learning-path-title" className="flex flex-col gap-4">
        <h2 id="learning-path-title" className="font-display text-2xl font-bold">Your learning path</h2>
        {stages.length === 0 && englishStages.length === 0 ? (
          <Card className="rounded-3xl border-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="size-5 text-brand" aria-hidden="true" /> Mathematics</CardTitle><CardDescription>No Mathematics levels are assigned to your account yet.</CardDescription></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Use the course options below or ask your administrator to assign a level.</p></CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {stages.length > 0 && (
              <CourseDrawer
                title="Mathematics"
                description="Numbers, patterns and problem solving"
                icon={<Image src="/scene-math.png" alt="" width={44} height={44} className="size-11 rounded-2xl object-cover" />}
                stages={stages}
                lessons={lessons}
                progress={progress}
                course="math"
                liveClassLinks={liveClassLinks}
                defaultOpen
              />
            )}
            {englishStages.length > 0 && (
              <CourseDrawer
                title="English"
                description="Grade 1 and Grade 2 reading, words and grammar"
                icon={<span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><BookOpen className="size-5" aria-hidden="true" /></span>}
                stages={englishStages}
                lessons={lessons}
                progress={progress}
                course="math"
                liveClassLinks={liveClassLinks}
                defaultOpen={stages.length === 0}
              />
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function CourseDrawer({ title, description, icon, stages, lessons, progress, course, liveClassLinks, defaultOpen }: {
  title: string
  description: string
  icon: React.ReactNode
  stages: string[]
  lessons: MathCourseLesson[]
  progress: SimaCourseProgress[]
  course: "math"
  liveClassLinks: MathLiveClassLink[]
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className="group/math rounded-[2rem] border-2 border-border bg-card shadow-toy">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-5 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {icon}
        <span className="min-w-0 flex-1"><span className="block font-display text-lg font-bold">{title}</span><span className="block text-sm text-muted-foreground">{description}</span></span>
        <Badge variant="secondary" className="rounded-full">{stages.length} {stages.length === 1 ? "level" : "levels"}</Badge>
        <ChevronDown className="size-4 shrink-0 transition-transform group-open/math:rotate-180" aria-hidden="true" />
      </summary>
      <div className="flex flex-col gap-3 border-t border-border p-3 sm:p-5">
        {stages.map((stage) => {
          const stageLessons = lessons.filter((lesson) => lesson.stage === stage)
          return (
            <details key={stage} className="group/stage rounded-3xl border border-border">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 font-display font-bold">{stage}</span>
                <span className="text-xs text-muted-foreground">{stageLessons.filter((lesson) => lesson.unlocked).length} available</span>
                <ChevronDown className="size-4 shrink-0 transition-transform group-open/stage:rotate-180" aria-hidden="true" />
              </summary>
              <div className="border-t border-border p-3 sm:p-4"><CourseSchedule lessons={stageLessons} progress={progress} title={stage} course={course} liveClassLink={liveClassLinks.find((link) => link.stage === stage)} /></div>
            </details>
          )
        })}
      </div>
    </details>
  )
}

import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Lock } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { LessonView } from "@/components/learn/lesson-view"
import { SimaLessonView } from "@/components/sima/sima-lesson-view"
import { getMathLesson, getSavedLearningProgress, readMathQuiz } from "@/lib/math-lessons"
import { getUnlockedMathStages } from "@/lib/course-access"
import { createServiceClient } from "@/lib/supabase/server"
import { getSimaMember, getSimaPurchase } from "@/lib/sima/server"
import { isSimaAdminEmail } from "@/lib/sima/admin"
import { getSimaQuizForLesson, toPublicSimaQuiz } from "@/lib/sima/quiz"

export const metadata = { title: "Lesson | Matchless Grade", robots: { index: false, follow: false } }

export default async function LessonPage({ params }: { params: Promise<{ subject: string; lesson: string }> }) {
  const { subject: subjectId, lesson: lessonId } = await params
  const member = await getSimaMember()
  if (!member) redirect(`/login?next=${encodeURIComponent(`/learn/${subjectId}/${lessonId}`)}`)
  const isAdmin = isSimaAdminEmail(member.email)

  if (subjectId === "abacus") {
    const purchase = await getSimaPurchase(member)
    if (!purchase) redirect("/learn?access=required")
    let query = createServiceClient().from("sima_abacus_lessons")
      .select("id, week_number, lesson_number, schedule_week, schedule_lesson, title, summary, video_url, release_at, quiz_questions, is_published").eq("id", lessonId)
    if (!isAdmin) query = query.eq("is_published", true)
    const { data: lesson, error } = await query.maybeSingle()
    if (error) throw new Error("Unable to load this SIMA lesson.")
    if (!lesson || (!isAdmin && Date.parse(lesson.release_at) > Date.now())) notFound()
    const progress = await getSavedLearningProgress(member.id)
    return (
      <AppShell xp={progress.xp}>
        <SimaLessonView
          lesson={{ ...lesson, title: /^Week \d+ · Lesson \d+$/.test(lesson.title) ? `Week ${lesson.schedule_week} · Lesson ${lesson.schedule_lesson}` : lesson.title, week_number: lesson.schedule_week, lesson_number: lesson.schedule_lesson, video_url: lesson.video_url ?? "" }}
          questions={toPublicSimaQuiz(getSimaQuizForLesson(lesson))}
          progress={progress.abacus.find((item) => item.lesson_id === lesson.id)}
        />
      </AppShell>
    )
  }

  if (subjectId !== "math") notFound()
  const lesson = await getMathLesson(lessonId)
  if (!lesson || (!isAdmin && !lesson.is_published)) notFound()
  const unlockedStages = await getUnlockedMathStages(member.email)
  const hasAccess = unlockedStages.includes(lesson.stage)
  const released = isAdmin || Date.parse(lesson.release_at) <= Date.now()
  if (!hasAccess || !released) {
    const releaseDate = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(lesson.release_at))
    return (
      <AppShell>
        <section className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[2rem] border-2 border-border bg-card p-8 text-center shadow-toy">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary"><Lock className="size-5" aria-hidden="true" /></span>
          <h1 className="font-display text-2xl font-bold">{hasAccess ? `Week ${lesson.week_number} is scheduled` : `${lesson.stage} is locked`}</h1>
          <p className="text-muted-foreground">{hasAccess ? `This video opens on ${releaseDate} at 12:00 AM Lagos time. Earlier weeks remain available.` : "Your account does not include this Mathematics level yet."}</p>
          <Link href="/learn" className="font-bold text-brand underline-offset-4 hover:underline">Back to my lessons</Link>
        </section>
      </AppShell>
    )
  }
  const progress = await getSavedLearningProgress(member.id)
  return <AppShell xp={progress.xp}><LessonView lesson={lesson} questions={toPublicSimaQuiz(readMathQuiz(lesson.quiz_questions))} progress={progress.math.find((item) => item.lesson_id === lesson.id)} /></AppShell>
}

import { redirect } from "next/navigation"
import { BookOpenCheck, ChevronDown } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { LearnDashboard } from "@/components/learn/dashboard"
import { LearnCourseOptions } from "@/components/learn/course-options"
import { SimaCourseDashboard } from "@/components/sima/course-dashboard"
import { getMathCourse, getMathLiveClassLinks } from "@/lib/math-lessons"
import { getUnlockedMathStages } from "@/lib/course-access"
import { createServiceClient } from "@/lib/supabase/server"
import { getSimaMember, getSimaPurchase } from "@/lib/sima/server"
import { isSimaAdminEmail } from "@/lib/sima/admin"
import { getCurrentPriceForProgram, isEarlyBird } from "@/lib/program-pricing"

export const metadata = {
  title: "My learning path | Matchless Grade",
  description: "Your weekly Mathematics and SIMA Abacus video lessons, live classes, practice quizzes and saved progress.",
  robots: { index: false, follow: false },
}

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string | string[]; access?: string | string[] }>
}) {
  const params = await searchParams
  const member = await getSimaMember()
  if (!member) redirect("/login?next=%2Flearn")

  const isAdmin = isSimaAdminEmail(member.email)
  const [mathStages, simaPurchase] = await Promise.all([
    getUnlockedMathStages(member.email),
    getSimaPurchase(member),
  ])
  const [math, liveClassLinks] = await Promise.all([
    getMathCourse({ userId: member.id, isAdmin, stages: mathStages }),
    getMathLiveClassLinks(mathStages),
  ])
  const displayName = member.user_metadata?.full_name ?? member.user_metadata?.name ?? member.user_metadata?.username
  const name = typeof displayName === "string" && displayName.trim() ? displayName.trim() : member.email.split("@")[0]
  const hasSimaAccess = isAdmin || Boolean(simaPurchase)
  let simaLessons: { id: string; week_number: number; lesson_number: number; title: string; summary: string; release_at: string; xp_reward: number; unlocked: boolean }[] = []
  let simaProgress: { lesson_id: string; best_score: number; xp_awarded: number; attempts: number; completed_at: string | null }[] = []

  if (hasSimaAccess) {
    const service = createServiceClient()
    let lessonQuery = service
      .from("sima_abacus_lessons")
      .select("id, week_number:schedule_week, lesson_number:schedule_lesson, title, summary, release_at, xp_reward")
    if (!isAdmin) lessonQuery = lessonQuery.eq("is_published", true)

    const [{ data: lessonRows, error: lessonError }, { data: progressRows, error: progressError }] = await Promise.all([
      lessonQuery.order("schedule_week", { ascending: true }).order("schedule_lesson", { ascending: true }),
      service
        .from("sima_abacus_progress")
        .select("lesson_id, best_score, xp_awarded, attempts, completed_at")
        .eq("user_id", member.id),
    ])

    if (lessonError || progressError) throw new Error("Unable to load SIMA course progress.")
    const now = Date.now()
    simaLessons = (lessonRows ?? []).map((lesson) => ({
      ...lesson,
      title: /^Week \d+ · Lesson \d+$/.test(lesson.title) ? `Week ${lesson.week_number} · Lesson ${lesson.lesson_number}` : lesson.title,
      unlocked: Date.parse(lesson.release_at) <= now,
    }))
    simaProgress = progressRows ?? []
  }

  const simaLessonIds = new Set(simaLessons.map((lesson) => lesson.id))
  simaProgress = simaProgress.filter((item) => simaLessonIds.has(item.lesson_id))
  const simaXp = simaProgress.reduce((sum, item) => sum + item.xp_awarded, 0)
  const xp = simaXp + math.progress.reduce((sum, item) => sum + item.xp_awarded, 0)

  return (
    <AppShell xp={xp} accountName={name}>
      {params.payment === "confirmed" && (
        <p role="status" className="mb-6 rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm font-semibold">
          Payment confirmed. Your purchased course access is ready below.
        </p>
      )}
      {params.access === "required" && (
        <p role="status" className="mb-6 rounded-2xl border border-sun/40 bg-sun/10 p-4 text-sm font-semibold">
          That lesson requires a verified SIMA Abacus purchase. You can unlock it here.
        </p>
      )}
      <LearnDashboard lessons={math.lessons} progress={math.progress} name={name} liveClassLinks={liveClassLinks} simaLessonCount={simaLessons.length} simaCompleted={simaProgress.filter((item) => item.completed_at).length} simaXp={simaXp} />
      {hasSimaAccess && (
        <details className="group/sima mt-4 rounded-[2rem] border-2 border-border bg-card p-5 shadow-toy sm:p-6">
          <summary className="flex cursor-pointer list-none items-center gap-3 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <BookOpenCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-bold">SIMA Abacus · Basic 1</span>
              <span className="block text-sm text-muted-foreground">{simaLessons.length} lessons · your saved progress</span>
            </span>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">Unlocked</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/sima:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-5 border-t border-border pt-5">
            <SimaCourseDashboard lessons={simaLessons} progress={simaProgress} />
          </div>
        </details>
      )}
      <LearnCourseOptions
        email={member.email}
        unlockedMathStages={mathStages}
        hasSimaAccess={hasSimaAccess}
        mathPriceNgn={getCurrentPriceForProgram("mathematics") ?? 25_000}
        simaPriceNgn={getCurrentPriceForProgram("sima-abacus") ?? 30_000}
        isEarlyBird={isEarlyBird()}
      />
    </AppShell>
  )
}

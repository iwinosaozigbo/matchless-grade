import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { LearnDashboard } from "@/components/learn/dashboard"
import { LearnCourseOptions } from "@/components/learn/course-options"
import { getMathCourse, getMathLiveClassLinks } from "@/lib/math-lessons"
import { getUnlockedMathStages } from "@/lib/course-access"
import { createServiceClient } from "@/lib/supabase/server"
import { getSimaMember, getSimaPurchase } from "@/lib/sima/server"
import { isSimaAdminEmail } from "@/lib/sima/admin"
import { getCurrentPriceForProgram, isEarlyBird, isProgramId } from "@/lib/program-pricing"

export const metadata = {
  title: "My learning path | Matchless Grade",
  description: "Your weekly Mathematics, English and SIMA Abacus video lessons, live classes, practice quizzes and saved progress.",
  robots: { index: false, follow: false },
}

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string | string[]; access?: string | string[]; purchase?: string | string[] }>
}) {
  const params = await searchParams
  const member = await getSimaMember()
  if (!member) {
    const requestedPurchase = Array.isArray(params.purchase) ? params.purchase[0] : params.purchase
    const nextUrl = isProgramId(requestedPurchase) ? `/learn?purchase=${requestedPurchase}` : "/learn"
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`)
  }

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
      unlocked: isAdmin || Date.parse(lesson.release_at) <= now,
    }))
    simaProgress = progressRows ?? []
  }

  const simaLessonIds = new Set(simaLessons.map((lesson) => lesson.id))
  simaProgress = simaProgress.filter((item) => simaLessonIds.has(item.lesson_id))
  const simaXp = simaProgress.reduce((sum, item) => sum + item.xp_awarded, 0)
  const xp = simaXp + math.progress.reduce((sum, item) => sum + item.xp_awarded, 0)
  const requestedPurchase = Array.isArray(params.purchase) ? params.purchase[0] : params.purchase
  const openProgram = isProgramId(requestedPurchase) ? requestedPurchase : undefined

  return (
    <AppShell xp={xp} accountName={name}>
      {params.payment === "confirmed" && (
        <p role="status" className="mb-6 rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm font-semibold">
          Payment confirmed. Your purchased course access is ready below.
        </p>
      )}
      {params.access === "required" && (
        <p role="status" className="mb-6 rounded-2xl border border-sun/40 bg-sun/10 p-4 text-sm font-semibold">
          That lesson requires an active course subscription. You can unlock it below.
        </p>
      )}
      <LearnDashboard
        lessons={math.lessons}
        progress={math.progress}
        name={name}
        unlockedStages={mathStages}
        liveClassLinks={liveClassLinks}
        hasSimaAccess={hasSimaAccess}
        simaLessons={simaLessons}
        simaProgress={simaProgress}
      />
      <LearnCourseOptions
        email={member.email}
        unlockedMathStages={mathStages}
        hasSimaAccess={hasSimaAccess}
        mathPriceNgn={getCurrentPriceForProgram("mathematics") ?? 25_000}
        simaPriceNgn={getCurrentPriceForProgram("sima-abacus") ?? 30_000}
        englishPriceNgn={getCurrentPriceForProgram("english") ?? 25_000}
        isEarlyBird={isEarlyBird()}
        openProgram={openProgram}
      />
    </AppShell>
  )
}

import "server-only"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getAdminPayments } from "@/lib/sima/payments"
import type {
  SimaAdminAccessResult,
  SimaAdminActivity,
  SimaAdminDashboardData,
  SimaAdminLearner,
  SimaAdminLesson,
  SimaAdminLiveClassLink,
} from "@/lib/sima/admin-types"

function configuredAdminEmails() {
  return (process.env.SIMA_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isSimaAdminEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase()
  return Boolean(normalized) && configuredAdminEmails().includes(normalized as string)
}

export async function getSimaAdminAccess(): Promise<SimaAdminAccessResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.email) return { status: "sign-in" }

  const allowlist = configuredAdminEmails()
  if (allowlist.length === 0) return { status: "unconfigured" }
  if (!allowlist.includes(data.user.email.trim().toLowerCase())) return { status: "forbidden" }

  return {
    status: "authorized",
    user: { id: data.user.id, email: data.user.email },
  }
}

function displayName(user: { user_metadata?: Record<string, unknown> }) {
  const metadata = user.user_metadata ?? {}
  const candidate = metadata.full_name ?? metadata.name ?? metadata.display_name
  return typeof candidate === "string" && candidate.trim() ? candidate.trim().slice(0, 120) : null
}

export async function getSimaAdminDashboard(): Promise<SimaAdminDashboardData> {
  const service = createServiceClient()
  const [flutterwave, paymentResult, overrideResult, progressResult, lessonResult, liveClassLinkResult, activityResult] = await Promise.all([
    getAdminPayments(),
    service
      .from("sima_abacus_payments")
      .select("id, user_id, payer_email, amount_ngn, verified_at")
      .order("verified_at", { ascending: false }),
    service
      .from("sima_abacus_access_overrides")
      .select("email, is_granted, reason, updated_at"),
    service
      .from("sima_abacus_progress")
      .select("user_id, lesson_id, completed_at, updated_at"),
    service
      .from("sima_abacus_lessons")
      .select("id, week_number:schedule_week, lesson_number:schedule_lesson, title, summary, video_url, release_at, is_published")
      .order("schedule_week", { ascending: true })
      .order("schedule_lesson", { ascending: true }),
    service
      .from("math_live_class_links")
      .select("cohort_key, join_url, schedule_info, updated_at")
      .order("cohort_key", { ascending: true }),
    service
      .from("sima_abacus_admin_audit")
      .select("id, action, target_email, reason, details, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  if (paymentResult.error || overrideResult.error || progressResult.error || lessonResult.error || liveClassLinkResult.error || activityResult.error) {
    throw new Error("Unable to load SIMA admin data.")
  }

  const payments = paymentResult.data ?? []
  const overrides = overrideResult.data ?? []
  const progress = progressResult.data ?? []
  const lessons = (lessonResult.data ?? []).map((lesson) => ({
    ...lesson,
    title: /^Week \d+ · Lesson \d+$/.test(lesson.title) ? `Week ${lesson.week_number} · Lesson ${lesson.lesson_number}` : lesson.title,
  })) as SimaAdminLesson[]
  const userIds = new Set<string>()
  payments.forEach((payment) => payment.user_id && userIds.add(payment.user_id))
  progress.forEach((row) => userIds.add(row.user_id))

  const usersById = new Map<string, { email: string; name: string | null; createdAt: string | null }>()
  const unresolved = new Set(userIds)
  for (let page = 1; unresolved.size > 0 && page <= 20; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error("Unable to load SIMA learner accounts.")

    for (const user of data.users) {
      if (!user.email) continue
      const email = user.email.trim().toLowerCase()
      usersById.set(user.id, {
        email,
        name: displayName(user),
        createdAt: user.created_at ?? null,
      })
      unresolved.delete(user.id)
    }
    if (data.users.length < 1000) break
  }

  const paymentByEmail = new Map<string, { count: number; amount: number; latest: string | null; userId: string | null }>()
  for (const payment of payments) {
    const email = payment.payer_email.trim().toLowerCase()
    const existing = paymentByEmail.get(email) ?? { count: 0, amount: 0, latest: null, userId: payment.user_id }
    existing.count += 1
    existing.amount += payment.amount_ngn
    if (!existing.latest || payment.verified_at > existing.latest) existing.latest = payment.verified_at
    if (!existing.userId && payment.user_id) existing.userId = payment.user_id
    paymentByEmail.set(email, existing)
  }

  const overridesByEmail = new Map(overrides.map((row) => [row.email, row]))
  const progressByEmail = new Map<string, { started: number; completed: number; latest: string | null }>()
  for (const row of progress) {
    const user = usersById.get(row.user_id)
    if (!user) continue
    const current = progressByEmail.get(user.email) ?? { started: 0, completed: 0, latest: null }
    current.started += 1
    if (row.completed_at) current.completed += 1
    if (!current.latest || row.updated_at > current.latest) current.latest = row.updated_at
    progressByEmail.set(user.email, current)
  }

  const learnerEmails = new Set([
    ...paymentByEmail.keys(),
    ...overridesByEmail.keys(),
    ...progressByEmail.keys(),
  ])
  const learners: SimaAdminLearner[] = []
  for (const email of learnerEmails) {
    const payment = paymentByEmail.get(email)
    const override = overridesByEmail.get(email)
    const progressRow = progressByEmail.get(email)
    const userId = payment?.userId ?? [...usersById.entries()].find(([, user]) => user.email === email)?.[0] ?? null
    const user = userId ? usersById.get(userId) : undefined
    const activityTimes = [payment?.latest, override?.updated_at, progressRow?.latest].filter(
      (value): value is string => Boolean(value),
    )

    learners.push({
      userId,
      email,
      name: user?.name ?? null,
      createdAt: user?.createdAt ?? null,
      hasAccess: override ? override.is_granted : Boolean(payment),
      override: override ? override.is_granted : null,
      overrideReason: override?.reason ?? null,
      paidAt: payment?.latest ?? null,
      paidAmountNgn: payment?.amount ?? 0,
      completedLessons: progressRow?.completed ?? 0,
      totalLessonsStarted: progressRow?.started ?? 0,
      latestActivity: activityTimes.sort().at(-1) ?? null,
    })
  }
  learners.sort((a, b) => (b.latestActivity ?? "").localeCompare(a.latestActivity ?? ""))

  const activity = (activityResult.data ?? []) as SimaAdminActivity[]
  const now = Date.now()
  return {
    summary: {
      learnerCount: learners.length,
      paymentCount: payments.length,
      revenueNgn: payments.reduce((total, payment) => total + payment.amount_ngn, 0),
      accessGrantedCount: overrides.filter((row) => row.is_granted).length,
      accessRevokedCount: overrides.filter((row) => !row.is_granted).length,
      lessonCount: lessons.length,
      publishedLessonCount: lessons.filter((lesson) => lesson.is_published).length,
      upcomingLessonCount: lessons.filter(
        (lesson) => lesson.is_published && Date.parse(lesson.release_at) > now,
      ).length,
    },
    payments: flutterwave.payments,
    paymentsError: flutterwave.error,
    learners,
    lessons,
    liveClassLinks: (liveClassLinkResult.data ?? []) as SimaAdminLiveClassLink[],
    activity,
  }
}

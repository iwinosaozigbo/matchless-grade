import "server-only"

import { createServiceClient } from "@/lib/supabase/server"
import { isSimaAdminEmail } from "@/lib/sima/admin"
import { activePeriodFilter, isPeriodActive } from "@/lib/subscription"
import { ENGLISH_COURSE_IDS, MATH_COURSE_IDS, stageForMathCourse, type CourseId, type LessonCourseId } from "@/lib/course-catalog"

export type AdminAccount = {
  userId: string
  email: string
  name: string | null
  createdAt: string | null
  lastSignInAt: string | null
  isAdmin: boolean
  courses: Record<CourseId, boolean>
  paidMathBundle: boolean
  paidSima: boolean
}

/** Recorded-lesson stages (Mathematics levels such as "Upper Basic", and English) the signed-in email may watch. */
export async function getUnlockedMathStages(email: string): Promise<string[]> {
  const normalized = email.trim().toLowerCase()
  if (isSimaAdminEmail(normalized)) return [...MATH_COURSE_IDS, ...ENGLISH_COURSE_IDS].map(stageForMathCourse)

  const service = createServiceClient()
  const [grants, enrollments] = await Promise.all([
    service.from("course_access_grants").select("course_id").eq("email", normalized),
    service
      .from("program_enrollments")
      .select("id")
      .eq("email", normalized)
      .eq("program_id", "mathematics")
      .eq("payment_status", "successful")
      .or(activePeriodFilter())
      .limit(1),
  ])
  if (grants.error || enrollments.error) throw new Error("Unable to check course access.")

  const lessonCourseIds: LessonCourseId[] = [...MATH_COURSE_IDS, ...ENGLISH_COURSE_IDS]
  const granted = (grants.data ?? [])
    .map((row) => row.course_id as LessonCourseId)
    .filter((id) => lessonCourseIds.includes(id))
  const ids = enrollments.data?.length ? [...MATH_COURSE_IDS, ...granted] : granted
  return [...new Set(ids)].map(stageForMathCourse)
}

function displayName(metadata: Record<string, unknown> | undefined) {
  const candidate = metadata?.full_name ?? metadata?.name ?? metadata?.display_name ?? metadata?.username
  return typeof candidate === "string" && candidate.trim() ? candidate.trim().slice(0, 120) : null
}

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  const service = createServiceClient()
  const [grants, overrides, simaPayments, enrollments] = await Promise.all([
    service.from("course_access_grants").select("email, course_id"),
    service.from("sima_abacus_access_overrides").select("email, is_granted"),
    service.from("sima_abacus_payments").select("user_id, payer_email, current_period_end"),
    service.from("program_enrollments").select("email, program_id, payment_status, current_period_end"),
  ])
  if (grants.error || overrides.error || simaPayments.error || enrollments.error) {
    throw new Error("Unable to load account access.")
  }

  const grantSet = new Set((grants.data ?? []).map((row) => `${row.email}|${row.course_id}`))
  const overrideByEmail = new Map((overrides.data ?? []).map((row) => [row.email, row.is_granted as boolean]))
  const activeSimaPayments = (simaPayments.data ?? []).filter((row) => isPeriodActive(row.current_period_end))
  const simaPaidUsers = new Set(activeSimaPayments.map((row) => row.user_id).filter(Boolean))
  const simaPaidEmails = new Set(activeSimaPayments.map((row) => row.payer_email?.trim().toLowerCase()))
  const paidEnrollments = (enrollments.data ?? []).filter(
    (row) => row.payment_status === "successful" && isPeriodActive(row.current_period_end),
  )
  const mathPaidEmails = new Set(paidEnrollments.filter((r) => r.program_id === "mathematics").map((r) => r.email))
  const simaEnrollEmails = new Set(paidEnrollments.filter((r) => r.program_id === "sima-abacus").map((r) => r.email))

  const accounts: AdminAccount[] = []
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error("Unable to load accounts.")

    for (const user of data.users) {
      if (!user.email) continue
      const email = user.email.trim().toLowerCase()
      const isAdmin = isSimaAdminEmail(email)
      const paidSima = simaPaidUsers.has(user.id) || simaPaidEmails.has(email) || simaEnrollEmails.has(email)
      const override = overrideByEmail.get(email)
      const paidMathBundle = mathPaidEmails.has(email)
      accounts.push({
        userId: user.id,
        email,
        name: displayName(user.user_metadata),
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        isAdmin,
        paidMathBundle,
        paidSima,
        courses: {
          "sima-abacus": isAdmin || (override ?? paidSima),
          "math-nursery-2-basic-1": isAdmin || paidMathBundle || grantSet.has(`${email}|math-nursery-2-basic-1`),
          "math-basic-2-3": isAdmin || paidMathBundle || grantSet.has(`${email}|math-basic-2-3`),
          "math-upper-basic": isAdmin || paidMathBundle || grantSet.has(`${email}|math-upper-basic`),
          "math-junior-secondary": isAdmin || paidMathBundle || grantSet.has(`${email}|math-junior-secondary`),
          "math-senior-secondary": isAdmin || paidMathBundle || grantSet.has(`${email}|math-senior-secondary`),
          "english-grade-1": isAdmin || grantSet.has(`${email}|english-grade-1`),
        },
      })
    }
    if (data.users.length < 1000) break
  }

  return accounts.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
}

export async function setCourseAccess(params: {
  email: string
  courseId: CourseId
  granted: boolean
  actorId: string
}) {
  const service = createServiceClient()
  const { email, courseId, granted, actorId } = params
  const now = new Date().toISOString()

  if (courseId === "sima-abacus") {
    const { error } = await service.from("sima_abacus_access_overrides").upsert(
      {
        email,
        user_id: null,
        is_granted: granted,
        reason: granted ? "Granted from admin accounts." : "Revoked from admin accounts.",
        changed_by: actorId,
        updated_at: now,
      },
      { onConflict: "email" },
    )
    if (error) throw new Error("Could not update SIMA Abacus access.")
  } else if (granted) {
    const { error } = await service
      .from("course_access_grants")
      .upsert({ email, course_id: courseId, granted_by: actorId }, { onConflict: "email,course_id" })
    if (error) throw new Error("Could not grant course access.")
  } else {
    const { error } = await service.from("course_access_grants").delete().eq("email", email).eq("course_id", courseId)
    if (error) throw new Error("Could not remove course access.")
  }

  await service.from("sima_abacus_admin_audit").insert({
    actor_id: actorId,
    target_email: email,
    action: granted ? "course_access_granted" : "course_access_revoked",
    reason: `${granted ? "Granted" : "Removed"} ${courseId}.`,
    details: { courseId },
  })
}

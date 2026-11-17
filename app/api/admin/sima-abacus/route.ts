import { NextResponse, type NextRequest } from "next/server"
import { getSimaAdminAccess, getSimaAdminDashboard } from "@/lib/sima/admin"
import { createServiceClient } from "@/lib/supabase/server"

function hasSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite) return fetchSite === "same-origin"
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() ?? request.headers.get("host")
    return new URL(origin).host === host
  } catch {
    return false
  }
}

async function requireAdmin() {
  const access = await getSimaAdminAccess()
  if (access.status === "authorized") return { actor: access.user, response: null }
  const status = access.status === "sign-in" ? 401 : access.status === "unconfigured" ? 503 : 403
  const message = access.status === "sign-in" ? "Sign in to continue." : access.status === "unconfigured" ? "Admin access is not configured." : "You do not have permission to manage this course."
  return { actor: null, response: NextResponse.json({ error: message }, { status }) }
}

export async function GET() {
  const { response } = await requireAdmin()
  if (response) return response
  try {
    return NextResponse.json(await getSimaAdminDashboard(), {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    })
  } catch {
    return NextResponse.json({ error: "Unable to load admin data." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })
  const { actor, response } = await requireAdmin()
  if (response || !actor) return response

  let body: { action?: unknown; email?: unknown; reason?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const action = body.action
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : ""
  if (action !== "grant" && action !== "revoke") {
    return NextResponse.json({ error: "Choose whether to grant or revoke access." }, { status: 400 })
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid learner email address." }, { status: 400 })
  }

  const service = createServiceClient()
  const isGranted = action === "grant"
  const { error: overrideError } = await service.from("sima_abacus_access_overrides").upsert(
    {
      email,
      user_id: null,
      is_granted: isGranted,
      reason,
      changed_by: actor.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  )
  if (overrideError) return NextResponse.json({ error: "Could not update course access." }, { status: 500 })

  const { error: auditError } = await service.from("sima_abacus_admin_audit").insert({
    actor_id: actor.id,
    target_email: email,
    action: isGranted ? "access_granted" : "access_revoked",
    reason,
  })
  if (auditError) return NextResponse.json({ error: "Access was updated, but the audit record could not be saved." }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })
  const { actor, response } = await requireAdmin()
  if (response || !actor) return response

  let body: { action?: unknown; cohortKey?: unknown; joinUrl?: unknown; scheduleInfo?: unknown; lessonId?: unknown; isPublished?: unknown; releaseAt?: unknown }
  try {
    const payload: unknown = await request.json()
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }
    body = payload as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (body.action === "saveLiveClassLink") {
    const cohortKey = typeof body.cohortKey === "string" ? body.cohortKey : ""
    const allowedCohorts = ["Nursery 2 & Basic 1", "Basic 2-3", "Upper Basic", "Junior Secondary", "Senior Secondary"]
    if (!allowedCohorts.includes(cohortKey)) {
      return NextResponse.json({ error: "Choose a valid Mathematics cohort." }, { status: 400 })
    }

    const joinUrl = typeof body.joinUrl === "string" ? body.joinUrl.trim() : ""
    const scheduleInfo = typeof body.scheduleInfo === "string" ? body.scheduleInfo.trim() : ""
    if (joinUrl.length > 2048 || scheduleInfo.length > 160) {
      return NextResponse.json({ error: "The link or schedule details are too long." }, { status: 400 })
    }
    if (joinUrl) {
      try {
        const parsedUrl = new URL(joinUrl)
        if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname || parsedUrl.username || parsedUrl.password) {
          throw new Error("Invalid class link")
        }
      } catch {
        return NextResponse.json({ error: "Enter a valid HTTPS live-class link." }, { status: 400 })
      }
    }

    const service = createServiceClient()
    const linkResult = joinUrl
      ? await service.from("math_live_class_links").upsert({
          cohort_key: cohortKey,
          join_url: joinUrl,
          schedule_info: scheduleInfo,
          updated_at: new Date().toISOString(),
          updated_by: actor.id,
        }, { onConflict: "cohort_key" })
      : await service.from("math_live_class_links").delete().eq("cohort_key", cohortKey)
    if (linkResult.error) return NextResponse.json({ error: "Could not update the live-class link." }, { status: 500 })

    const { error: auditError } = await service.from("sima_abacus_admin_audit").insert({
      actor_id: actor.id,
      target_email: `live-class:${cohortKey}`,
      action: joinUrl ? "live_class_link_updated" : "live_class_link_removed",
      reason: "Updated from the admin live-class settings.",
      details: { cohort: cohortKey, scheduleInfo: joinUrl ? scheduleInfo : "" },
    })
    if (auditError) return NextResponse.json({ error: "The link was updated, but the audit record could not be saved." }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  const lessonId = typeof body.lessonId === "string" ? body.lessonId : ""
  if (!/^basic1-(?:w\d{2}-l\d{2}|summary)$/.test(lessonId)) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  }
  const updates: { is_published?: boolean; release_at?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  }
  if (typeof body.isPublished === "boolean") updates.is_published = body.isPublished
  if (typeof body.releaseAt === "string") {
    const releaseTime = Date.parse(body.releaseAt)
    if (!Number.isFinite(releaseTime)) return NextResponse.json({ error: "Choose a valid release time." }, { status: 400 })
    updates.release_at = new Date(releaseTime).toISOString()
  }
  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "Choose a publish status or release time to update." }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: before, error: beforeError } = await service
    .from("sima_abacus_lessons")
    .select("id, is_published, release_at")
    .eq("id", lessonId)
    .maybeSingle()
  if (beforeError) return NextResponse.json({ error: "Unable to load the lesson." }, { status: 500 })
  if (!before) return NextResponse.json({ error: "Lesson not found." }, { status: 404 })

  const { error: updateError } = await service
    .from("sima_abacus_lessons")
    .update(updates)
    .eq("id", lessonId)
  if (updateError) return NextResponse.json({ error: "Could not update the lesson timetable." }, { status: 500 })

  const nextPublished = updates.is_published ?? before.is_published
  const action = updates.is_published !== undefined && updates.is_published !== before.is_published
    ? updates.is_published ? "lesson_published" : "lesson_unpublished"
    : "lesson_schedule_updated"
  const { error: auditError } = await service.from("sima_abacus_admin_audit").insert({
    actor_id: actor.id,
    target_email: `lesson:${lessonId}`,
    action,
    reason: "Updated from the admin timetable.",
    details: {
      isPublished: nextPublished,
      releaseAt: updates.release_at ?? before.release_at,
    },
  })
  if (auditError) return NextResponse.json({ error: "The lesson was updated, but the audit record could not be saved." }, { status: 500 })
  return NextResponse.json({ ok: true })
}

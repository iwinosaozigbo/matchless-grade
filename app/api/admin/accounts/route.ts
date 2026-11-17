import { NextResponse, type NextRequest } from "next/server"
import { getSimaAdminAccess } from "@/lib/sima/admin"
import { setCourseAccess } from "@/lib/course-access"
import { COURSES, isCourseId } from "@/lib/course-catalog"
import { createServiceClient } from "@/lib/supabase/server"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

async function authorize(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return { error: NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 }) }
  }
  const access = await getSimaAdminAccess()
  if (access.status !== "authorized") {
    const status = access.status === "sign-in" ? 401 : access.status === "unconfigured" ? 503 : 403
    return { error: NextResponse.json({ error: "You do not have permission to manage accounts." }, { status }) }
  }
  return { actor: access.user }
}

async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request)
  if ("error" in auth) return auth.error

  const body = await readJson(request)
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 })

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : ""
  const courses = COURSES.map((course) => course.id)

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: "Password must be 8 to 72 characters." }, { status: 400 })
  }
  const service = createServiceClient()
  const { error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : {},
  })
  if (createError) {
    const exists = /already|registered|exists/i.test(createError.message)
    return NextResponse.json(
      { error: exists ? "An account with this email already exists." : "Could not create the account." },
      { status: exists ? 409 : 500 },
    )
  }

  try {
    for (const courseId of courses) {
      await setCourseAccess({ email, courseId, granted: true, actorId: auth.actor.id })
    }
  } catch {
    return NextResponse.json({ error: "Account created, but some course access could not be saved." }, { status: 500 })
  }

  await service.from("sima_abacus_admin_audit").insert({
    actor_id: auth.actor.id,
    target_email: email,
    action: "account_created",
    reason: courses.length ? `Account created with ${courses.join(", ")}.` : "Account created.",
    details: { courses },
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: NextRequest) {
  const auth = await authorize(request)
  if ("error" in auth) return auth.error

  const body = await readJson(request)
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 })

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  if (!isCourseId(body.courseId)) return NextResponse.json({ error: "Choose a valid course." }, { status: 400 })
  if (typeof body.granted !== "boolean") return NextResponse.json({ error: "Missing access value." }, { status: 400 })

  try {
    await setCourseAccess({ email, courseId: body.courseId, granted: body.granted, actorId: auth.actor.id })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update access." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

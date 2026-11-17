import { NextResponse, type NextRequest } from "next/server"
import { getSimaAdminAccess } from "@/lib/sima/admin"
import { generateReferralCode, normalizeReferralCode } from "@/lib/referrals"
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

async function authorize(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return { error: NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 }) }
  }
  const access = await getSimaAdminAccess()
  if (access.status !== "authorized") {
    const status = access.status === "sign-in" ? 401 : access.status === "unconfigured" ? 503 : 403
    return { error: NextResponse.json({ error: "You do not have permission to manage referral codes." }, { status }) }
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

  const rawCode = typeof body.code === "string" ? body.code.trim() : ""
  const code = rawCode ? normalizeReferralCode(rawCode) : generateReferralCode()
  if (!code) {
    return NextResponse.json(
      { error: "Codes must be 3 to 32 characters using letters, numbers, hyphens or underscores." },
      { status: 400 },
    )
  }

  const label = typeof body.label === "string" ? body.label.trim().slice(0, 120) : ""

  let maxUses: number | null = null
  if (body.maxUses !== null && body.maxUses !== undefined && body.maxUses !== "") {
    const parsed = Number(body.maxUses)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1_000_000) {
      return NextResponse.json({ error: "Usage limit must be a whole number of 1 or more." }, { status: 400 })
    }
    maxUses = parsed
  }

  let expiresAt: string | null = null
  if (typeof body.expiresAt === "string" && body.expiresAt) {
    const parsed = new Date(body.expiresAt)
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Choose an expiry date in the future." }, { status: 400 })
    }
    expiresAt = parsed.toISOString()
  }

  const service = createServiceClient()
  const { error } = await service.from("referral_codes").insert({
    code,
    label: label || null,
    max_uses: maxUses,
    expires_at: expiresAt,
    created_by: auth.actor.id,
  })
  if (error) {
    const duplicate = error.code === "23505"
    return NextResponse.json(
      { error: duplicate ? "That code already exists." : "Could not create the referral code." },
      { status: duplicate ? 409 : 500 },
    )
  }

  return NextResponse.json({ ok: true, code })
}

export async function PATCH(request: NextRequest) {
  const auth = await authorize(request)
  if ("error" in auth) return auth.error

  const body = await readJson(request)
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  if (typeof body.id !== "string" || !body.id) return NextResponse.json({ error: "Missing code id." }, { status: 400 })
  if (typeof body.isActive !== "boolean") return NextResponse.json({ error: "Missing active value." }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.from("referral_codes").update({ is_active: body.isActive }).eq("id", body.id)
  if (error) return NextResponse.json({ error: "Could not update the referral code." }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await authorize(request)
  if ("error" in auth) return auth.error

  const body = await readJson(request)
  if (!body || typeof body.id !== "string" || !body.id) {
    return NextResponse.json({ error: "Missing code id." }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service.from("referral_codes").delete().eq("id", body.id)
  if (error) return NextResponse.json({ error: "Could not delete the referral code." }, { status: 500 })
  return NextResponse.json({ ok: true })
}

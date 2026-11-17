import { NextResponse, type NextRequest } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PAGE_SIZE = 1000
const INVALID_CREDENTIALS = "Invalid username/email or password. Check your details or use Forgot password to reset your password."

function hasSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite) return fetchSite === "same-origin"
  const origin = request.headers.get("origin")
  if (!origin) return false

  try {
    const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() ?? request.headers.get("host")
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const { identifier, password } = body as Record<string, unknown>
  const normalizedIdentifier = typeof identifier === "string" ? identifier.trim() : ""
  if (
    !normalizedIdentifier ||
    normalizedIdentifier.length > 254 ||
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 72
  ) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 })
  }

  if (EMAIL_PATTERN.test(normalizedIdentifier)) {
    return NextResponse.json({ error: "Use email sign-in for email addresses." }, { status: 400 })
  }

  const service = createServiceClient()
  let email: string | null = null
  let page = 1

  while (true) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: PAGE_SIZE })
    if (error) {
      console.error("[sima-sign-in] Username lookup failed:", error.message)
      return NextResponse.json({ error: "Unable to sign in right now. Please try again." }, { status: 503 })
    }

    for (const user of data.users) {
      const username = user.user_metadata?.username
      const matchesUsername = typeof username === "string" && username.trim().toLowerCase() === normalizedIdentifier.toLowerCase()
      const matchesLegacyEmail = user.email?.toLowerCase() === normalizedIdentifier.toLowerCase()
      if (!matchesUsername && !matchesLegacyEmail) continue
      if (email) return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 })
      email = user.email ?? null
    }

    if (data.users.length < PAGE_SIZE) break
    page += 1
  }

  if (!email) return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 })

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

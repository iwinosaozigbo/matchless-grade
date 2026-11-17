import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Creates a pre-confirmed SIMA account so signup/checkout never depends on Supabase's
// built-in mailer (which only delivers to project team members and is heavily rate-limited).
// Existing accounts are never modified — the client falls back to password sign-in.
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const text = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 120) : "")

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }
  if (password.length < 6 || password.length > 72) {
    return NextResponse.json({ error: "Password must be between 6 and 72 characters." }, { status: 400 })
  }

  const supabase = createServiceClient()
  const firstName = text(body.firstName)
  const lastName = text(body.lastName)
  const fullName = `${firstName} ${lastName}`.trim()
  const productId = typeof body.productId === "string" ? body.productId.trim().slice(0, 64) : "sima-abacus"

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      ...(fullName ? { full_name: fullName } : {}),
      first_name: firstName,
      last_name: lastName,
      username: text(body.username),
      phone: text(body.phone),
      age_group: text(body.ageGroup),
      grade_level: text(body.gradeLevel),
      school: text(body.school),
      guardian_name: text(body.guardianName),
      guardian_phone: text(body.guardianPhone),
      product_id: productId || "sima-abacus",
    },
  })

  if (error) {
    const exists = error.status === 422 || /already|exists|registered/i.test(error.message)
    if (exists) return NextResponse.json({ exists: true })
    console.error("[sima-account] createUser failed:", error.message)
    return NextResponse.json({ error: "We couldn't create your account. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ created: true })
}

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

const KINDS = ["diagnostic", "school", "employer", "contact"] as const
type Kind = (typeof KINDS)[number]

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim().slice(0, max)
  return trimmed || null
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (clean(body.website, 100)) return NextResponse.json({ ok: true })

  const kind = body.kind as Kind
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Invalid request." }, { status: 400 })

  const name = clean(body.name, 120)
  const email = clean(body.email, 200)
  const phone = clean(body.phone, 30)

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 })
  if (!phone && !email) {
    return NextResponse.json({ error: "Please enter a WhatsApp number or email." }, { status: 400 })
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }
  if (phone && phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 })
  }

  const { error } = await createServiceClient().from("leads").insert({
    kind,
    name,
    email,
    phone,
    organisation: clean(body.organisation, 160),
    child_class: clean(body.childClass, 60),
    message: clean(body.message, 1000),
  })

  if (error) {
    console.error("Failed to save lead", error.message)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

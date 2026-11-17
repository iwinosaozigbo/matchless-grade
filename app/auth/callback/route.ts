import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function safeNextPath(value: string | null) {
  if (value === "/admin") return "/admin"
  if (value === "/reset-password?next=/admin" || value === "/reset-password?next=%2Fadmin") {
    return "/reset-password?next=%2Fadmin"
  }
  if (value === "/reset-password?next=/learn" || value === "/reset-password?next=%2Flearn") {
    return "/reset-password?next=%2Flearn"
  }
  return "/learn"
}

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const nextPath = safeNextPath(searchParams.get("next"))

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  return NextResponse.redirect(new URL(nextPath, origin))
}

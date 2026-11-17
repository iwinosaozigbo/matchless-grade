import { NextResponse } from "next/server"
import { checkReferralCode } from "@/lib/referrals"

const MESSAGES = {
  invalid: "That referral code isn't valid.",
  inactive: "That referral code is no longer active.",
  expired: "That referral code has expired.",
  limit_reached: "That referral code has reached its usage limit.",
} as const

export async function POST(req: Request) {
  let code: unknown
  try {
    code = (await req.json())?.code
  } catch {
    return NextResponse.json({ valid: false, message: MESSAGES.invalid }, { status: 400 })
  }

  const result = await checkReferralCode(code)
  if (result.valid) return NextResponse.json({ valid: true })
  return NextResponse.json({ valid: false, message: MESSAGES[result.reason] })
}

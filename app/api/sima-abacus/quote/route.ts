import { NextResponse } from "next/server"
import { getProgram, getProgramPriceNgn } from "@/lib/program-pricing"
import { getLocalizedSimaPrice } from "@/lib/sima/currency"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const program = getProgram("sima-abacus")!
  const rawAmount = new URL(request.url).searchParams.get("amountNgn")
  const amountNgn = rawAmount === null ? getProgramPriceNgn(program) : Number(rawAmount)
  const allowedAmounts = new Set([
    getProgramPriceNgn(program),
    program.earlyBirdPriceNgn,
    program.launchPriceNgn,
  ])

  if (!Number.isSafeInteger(amountNgn) || !allowedAmounts.has(amountNgn)) {
    return NextResponse.json({ error: "Choose a valid SIMA Abacus price." }, { status: 400 })
  }

  const price = await getLocalizedSimaPrice(
    amountNgn,
    request.headers.get("x-vercel-ip-country"),
    request.headers.get("accept-language"),
  )

  return NextResponse.json(price, {
    headers: { "Cache-Control": "private, no-store" },
  })
}

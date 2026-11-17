import { NextResponse } from "next/server"
import { getMonthlyPlanForProgram } from "@/lib/flutterwave-plans"
import { isProgramId } from "@/lib/program-pricing"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  let productId: unknown
  try {
    productId = (await req.json())?.productId
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!isProgramId(productId)) {
    return NextResponse.json({ error: "Choose a valid program." }, { status: 400 })
  }

  try {
    const { planId, amountNgn } = await getMonthlyPlanForProgram(productId)
    return NextResponse.json({ planId, amountNgn }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ error: "Monthly checkout is not available right now." }, { status: 503 })
  }
}

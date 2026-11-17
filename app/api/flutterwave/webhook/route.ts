import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { getProgramForPlan } from "@/lib/flutterwave-plans"
import { verifyFlutterwaveTransaction } from "@/lib/sima/payments"
import { nextPeriodEnd } from "@/lib/subscription"
import { createServiceClient } from "@/lib/supabase/server"

type WebhookPayload = {
  event?: string
  "event.type"?: string
  data?: {
    id?: number | string
    status?: string
    payment_plan?: number | string | null
    plan?: number | string | { id?: number | string } | null
    customer?: { email?: string | null; customer_email?: string | null } | null
  }
}

function hashMatches(received: string | null, expected: string) {
  if (!received) return false
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function planIdOf(data: NonNullable<WebhookPayload["data"]>) {
  const plan = data.payment_plan ?? (typeof data.plan === "object" && data.plan ? data.plan.id : data.plan)
  return plan === null || plan === undefined || plan === "" ? null : String(plan)
}

async function recordCharge(transactionId: string, planId: string) {
  const tx = await verifyFlutterwaveTransaction(transactionId)
  if (!tx || tx.status !== "successful" || tx.currency !== "NGN") return
  const email = tx.customer?.email?.trim().toLowerCase()
  if (!email) return

  const plan = await getProgramForPlan(planId)
  if (!plan || Number(tx.amount) !== plan.amountNgn) return

  const service = createServiceClient()
  const periodEnd = nextPeriodEnd(tx.created_at)

  if (plan.programId === "sima-abacus") {
    // The signup checkout (verify route) records the first charge; this stores each renewal.
    await service.from("sima_abacus_payments").upsert(
      {
        user_id: null,
        flutterwave_transaction_id: transactionId,
        tx_ref: tx.tx_ref ?? `renewal-${transactionId}`,
        payer_email: email,
        product_id: "sima-abacus",
        amount_ngn: plan.amountNgn,
        currency: "NGN",
        current_period_end: periodEnd,
      },
      { onConflict: "flutterwave_transaction_id", ignoreDuplicates: true },
    )
  }

  const { data: existing } = await service
    .from("program_enrollments")
    .select("id")
    .eq("flutterwave_transaction_id", transactionId)
    .maybeSingle()

  if (existing) {
    await service
      .from("program_enrollments")
      .update({ flutterwave_plan_id: planId, subscription_status: "active", updated_at: new Date().toISOString() })
      .eq("id", existing.id)
    return
  }

  await service.from("program_enrollments").insert({
    flutterwave_transaction_id: transactionId,
    tx_ref: tx.tx_ref,
    email,
    customer_name: tx.customer?.name ?? null,
    program_id: plan.programId,
    amount_ngn: plan.amountNgn,
    currency: "NGN",
    payment_status: "successful",
    paid_at: tx.created_at,
    flutterwave_plan_id: planId,
    subscription_status: "active",
    current_period_end: periodEnd,
  })
}

async function markCancelled(email: string, planId: string) {
  const service = createServiceClient()
  await service
    .from("program_enrollments")
    .update({ subscription_status: "cancelled", updated_at: new Date().toISOString() })
    .eq("email", email)
    .eq("flutterwave_plan_id", planId)
}

// Flutterwave calls this for every subscription charge and cancellation.
// Charges are always re-verified against the Flutterwave API, so they are safe without a secret
// hash. Cancellations carry no verifiable transaction, so they are only honoured when
// FLUTTERWAVE_WEBHOOK_HASH is set and matches the secret hash configured in the dashboard.
export async function POST(req: Request) {
  const expectedHash = process.env.FLUTTERWAVE_WEBHOOK_HASH?.trim()
  const signed = Boolean(expectedHash) && hashMatches(req.headers.get("verif-hash"), expectedHash as string)
  if (expectedHash && !signed) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 })
  }

  const event = payload.event ?? payload["event.type"]
  const data = payload.data
  if (!event || !data) return NextResponse.json({ received: true })

  try {
    if (event === "charge.completed" && data.id && data.status === "successful") {
      const planId = planIdOf(data)
      if (planId) await recordCharge(String(data.id), planId)
    } else if (event === "subscription.cancelled" && signed) {
      const planId = planIdOf(data)
      const email = (data.customer?.customer_email ?? data.customer?.email)?.trim().toLowerCase()
      if (planId && email) await markCancelled(email, planId)
    }
  } catch {
    // A non-2xx response makes Flutterwave retry the delivery.
    return NextResponse.json({ error: "Could not process the event." }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

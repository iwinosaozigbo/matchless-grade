import { NextResponse, type NextRequest } from "next/server"
import { getSimaAdminAccess } from "@/lib/sima/admin"
import { verifyFlutterwaveTransaction } from "@/lib/sima/payments"
import { getProgram, isProgramId } from "@/lib/program-pricing"
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

export async function PATCH(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })

  const access = await getSimaAdminAccess()
  if (access.status !== "authorized") {
    const status = access.status === "sign-in" ? 401 : access.status === "unconfigured" ? 503 : 403
    return NextResponse.json({ error: "You do not have permission to manage payments." }, { status })
  }
  const actor = access.user

  let body: { transactionId?: unknown; programId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : ""
  if (!/^\d{1,20}$/.test(transactionId)) return NextResponse.json({ error: "Transaction not found." }, { status: 404 })
  if (!isProgramId(body.programId)) return NextResponse.json({ error: "Choose a valid bundle." }, { status: 400 })
  const programId = body.programId

  let tx: Awaited<ReturnType<typeof verifyFlutterwaveTransaction>>
  try {
    tx = await verifyFlutterwaveTransaction(transactionId)
  } catch {
    return NextResponse.json({ error: "Flutterwave is not configured." }, { status: 503 })
  }
  if (!tx) return NextResponse.json({ error: "Flutterwave could not find this transaction." }, { status: 404 })
  if (tx.status !== "successful") {
    return NextResponse.json({ error: "Only successful payments can be assigned to a bundle." }, { status: 409 })
  }

  const email = tx.customer?.email?.trim().toLowerCase() ?? ""
  if (!email) return NextResponse.json({ error: "This payment has no customer email." }, { status: 422 })

  const service = createServiceClient()
  const { data: previous, error: previousError } = await service
    .from("program_enrollments")
    .select("program_id")
    .eq("flutterwave_transaction_id", transactionId)
    .maybeSingle()
  if (previousError) return NextResponse.json({ error: "Could not load the current bundle." }, { status: 500 })

  const now = new Date().toISOString()
  const { error: upsertError } = await service.from("program_enrollments").upsert(
    {
      flutterwave_transaction_id: transactionId,
      tx_ref: tx.tx_ref,
      email,
      customer_name: tx.customer?.name ?? null,
      program_id: programId,
      amount_ngn: Math.round(Number(tx.amount) || 0),
      currency: tx.currency,
      payment_status: tx.status,
      paid_at: tx.created_at,
      assigned_by: actor.id,
      updated_at: now,
    },
    { onConflict: "flutterwave_transaction_id" },
  )
  if (upsertError) return NextResponse.json({ error: "Could not save the bundle." }, { status: 500 })

  const programName = getProgram(programId)?.name ?? programId
  if (programId === "sima-abacus" || previous?.program_id === "sima-abacus") {
    const granted = programId === "sima-abacus"
    const { error: overrideError } = await service.from("sima_abacus_access_overrides").upsert(
      {
        email,
        user_id: null,
        is_granted: granted,
        reason: granted
          ? `Flutterwave payment ${transactionId} assigned to SIMA Abacus.`
          : `Flutterwave payment ${transactionId} moved to ${programName}.`,
        changed_by: actor.id,
        updated_at: now,
      },
      { onConflict: "email" },
    )
    if (overrideError) {
      return NextResponse.json({ error: "Bundle saved, but SIMA course access could not be updated." }, { status: 500 })
    }
  }

  await service.from("sima_abacus_admin_audit").insert({
    actor_id: actor.id,
    target_email: email,
    action: "payment_bundle_changed",
    reason: `Payment ${transactionId} assigned to ${programName}.`,
    details: { transactionId, from: previous?.program_id ?? null, to: programId },
  })

  return NextResponse.json({ ok: true })
}

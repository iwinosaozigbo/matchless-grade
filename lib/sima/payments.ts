import "server-only"

import { createServiceClient } from "@/lib/supabase/server"
import { PROGRAMS, isProgramId, type ProgramId } from "@/lib/program-pricing"
import type { AdminPayment, AdminPaymentProgramSource } from "@/lib/sima/admin-types"

type FlutterwaveTransaction = {
  id: number
  tx_ref: string | null
  amount: number
  currency: string
  status: string
  payment_type: string | null
  created_at: string
  customer?: { email?: string | null; name?: string | null } | null
}

const FLW_API = "https://api.flutterwave.com/v3"

function flutterwaveSecret() {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY?.trim()
  if (!secret) throw new Error("Flutterwave is not configured.")
  return secret
}

async function listFlutterwaveTransactions(): Promise<FlutterwaveTransaction[]> {
  const secret = flutterwaveSecret()
  const to = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
  const all: FlutterwaveTransaction[] = []

  for (let page = 1; page <= 50; page += 1) {
    const response = await fetch(`${FLW_API}/transactions?from=2025-01-01&to=${to}&page=${page}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    })
    const body = await response.json().catch(() => null)
    if (!response.ok || body?.status !== "success") throw new Error("Flutterwave transactions could not be loaded.")
    all.push(...((body.data ?? []) as FlutterwaveTransaction[]))
    const totalPages = Number(body.meta?.page_info?.total_pages ?? 1)
    if (page >= totalPages) break
  }
  return all
}

export async function verifyFlutterwaveTransaction(transactionId: string) {
  const response = await fetch(`${FLW_API}/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${flutterwaveSecret()}` },
    cache: "no-store",
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || body?.status !== "success" || !body.data) return null
  return body.data as FlutterwaveTransaction
}

function inferProgram(tx: Pick<FlutterwaveTransaction, "tx_ref" | "amount">): {
  programId: ProgramId | null
  source: AdminPaymentProgramSource
} {
  const fromRef = PROGRAMS.find((program) => tx.tx_ref?.startsWith(`sp-${program.id}-`))
  if (fromRef) return { programId: fromRef.id, source: "reference" }

  const amount = Number(tx.amount)
  const matches = PROGRAMS.filter(
    (program) => program.earlyBirdPriceNgn === amount || program.launchPriceNgn === amount,
  )
  if (matches.length === 1) return { programId: matches[0].id, source: "amount" }
  return { programId: null, source: "unknown" }
}

export async function getAdminPayments(): Promise<{ payments: AdminPayment[]; error: string | null }> {
  let transactions: FlutterwaveTransaction[]
  try {
    transactions = await listFlutterwaveTransactions()
  } catch (error) {
    return { payments: [], error: error instanceof Error ? error.message : "Flutterwave transactions could not be loaded." }
  }

  const service = createServiceClient()
  const { data: enrollments, error } = await service
    .from("program_enrollments")
    .select("flutterwave_transaction_id, program_id, updated_at")
  if (error) return { payments: [], error: "Bundle assignments could not be loaded." }

  const assigned = new Map((enrollments ?? []).map((row) => [row.flutterwave_transaction_id, row]))

  const payments = transactions.map<AdminPayment>((tx) => {
    const enrollment = assigned.get(String(tx.id))
    const inferred = inferProgram(tx)
    const programId = enrollment && isProgramId(enrollment.program_id) ? enrollment.program_id : inferred.programId
    return {
      transactionId: String(tx.id),
      txRef: tx.tx_ref ?? "",
      email: tx.customer?.email?.trim().toLowerCase() ?? "",
      name: tx.customer?.name?.trim() || null,
      amountNgn: Number(tx.amount) || 0,
      currency: tx.currency,
      status: tx.status,
      paymentType: tx.payment_type,
      paidAt: tx.created_at,
      programId,
      programSource: enrollment ? "assigned" : inferred.source,
    }
  })

  payments.sort((a, b) => b.paidAt.localeCompare(a.paidAt))
  return { payments, error: null }
}

import { PROGRAMS, getProgram, getProgramPriceNgn, type ProgramId } from "@/lib/program-pricing"

const FLW_API = "https://api.flutterwave.com/v3"

type FlutterwavePlan = {
  id: number
  name: string
  amount: number
  currency: string
  interval: string
  status?: string
}

const planCache = new Map<string, number>()

function secretKey() {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY?.trim()
  if (!secret) throw new Error("Flutterwave is not configured.")
  return secret
}

function planName(programName: string, amountNgn: number) {
  return `${programName} monthly subscription (NGN ${amountNgn})`
}

async function findExistingPlan(name: string, amountNgn: number, secret: string) {
  const params = new URLSearchParams({ amount: String(amountNgn), currency: "NGN", interval: "monthly" })
  const response = await fetch(`${FLW_API}/payment-plans?${params.toString()}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || body?.status !== "success") return null
  const plans = (body.data ?? []) as FlutterwavePlan[]
  return (
    plans.find(
      (plan) =>
        plan.name === name &&
        Number(plan.amount) === amountNgn &&
        plan.currency === "NGN" &&
        plan.interval === "monthly" &&
        (plan.status === undefined || plan.status === "active"),
    ) ?? null
  )
}

/** Resolves which program (and price) a Flutterwave plan belongs to, using the plan name we created. */
export async function getProgramForPlan(planId: string | number) {
  const response = await fetch(`${FLW_API}/payment-plans/${encodeURIComponent(String(planId))}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  })
  const body = await response.json().catch(() => null)
  const plan = body?.data as FlutterwavePlan | undefined
  if (!response.ok || body?.status !== "success" || !plan) return null
  if (plan.interval !== "monthly" || plan.currency !== "NGN") return null

  const program = PROGRAMS.find((item) => plan.name.startsWith(`${item.name} monthly subscription`))
  if (!program) return null
  return { programId: program.id as ProgramId, amountNgn: Number(plan.amount) }
}

// Every program is sold as a monthly subscription, so checkout always attaches one of these plans.
export async function getMonthlyPlanForProgram(programId: ProgramId, now: number = Date.now()) {
  const program = getProgram(programId)
  if (!program) throw new Error("Choose a valid program.")

  const amountNgn = getProgramPriceNgn(program, now)
  const name = planName(program.name, amountNgn)
  const cached = planCache.get(name)
  if (cached) return { planId: cached, amountNgn }

  const secret = secretKey()
  const existing = await findExistingPlan(name, amountNgn, secret)
  if (existing) {
    planCache.set(name, existing.id)
    return { planId: existing.id, amountNgn }
  }

  const response = await fetch(`${FLW_API}/payment-plans`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, amount: amountNgn, interval: "monthly", currency: "NGN" }),
    cache: "no-store",
  })
  const body = await response.json().catch(() => null)
  const planId = Number(body?.data?.id)
  if (!response.ok || body?.status !== "success" || !Number.isFinite(planId)) {
    throw new Error("The monthly plan could not be created.")
  }

  planCache.set(name, planId)
  return { planId, amountNgn }
}

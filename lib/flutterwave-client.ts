import type { ProgramId } from "@/lib/program-pricing"

export async function fetchMonthlyPlan(productId: ProgramId): Promise<{ planId: number; amountNgn: number }> {
  const response = await fetch("/api/flutterwave/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || typeof result.planId !== "number") {
    throw new Error(result.error || "Monthly checkout is not available right now.")
  }
  return { planId: result.planId, amountNgn: result.amountNgn }
}

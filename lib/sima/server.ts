import "server-only"

import type { User } from "@supabase/supabase-js"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { isSimaAdminEmail } from "@/lib/sima/admin"
import { activePeriodFilter } from "@/lib/subscription"

export type SimaMember = {
  id: string
  email: string
  user_metadata: User["user_metadata"]
}

export async function getSimaMember(): Promise<SimaMember | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.email) return null
  return {
    id: data.user.id,
    email: data.user.email,
    user_metadata: data.user.user_metadata,
  }
}

export async function getSimaPurchase(user: Pick<User, "id" | "email">) {
  const serviceClient = createServiceClient()
  const normalizedEmail = user.email?.trim().toLowerCase()

  if (isSimaAdminEmail(normalizedEmail)) {
    return { id: `admin:${user.id}`, amount_ngn: 0, verified_at: null, source: "admin" as const }
  }

  if (normalizedEmail) {
    const { data: override, error: overrideError } = await serviceClient
      .from("sima_abacus_access_overrides")
      .select("id, is_granted")
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (overrideError) throw new Error("Unable to check SIMA course access.")
    if (override) {
      if (!override.is_granted) return null
      return { id: override.id, amount_ngn: 0, verified_at: null, source: "admin" as const }
    }
  }

  const byUser = await serviceClient
    .from("sima_abacus_payments")
    .select("id, amount_ngn, verified_at")
    .eq("user_id", user.id)
    .or(activePeriodFilter())
    .limit(1)
    .maybeSingle()

  if (byUser.error) throw new Error("Unable to check SIMA course access.")
  if (byUser.data) return byUser.data
  if (!normalizedEmail) return null

  const byEmail = await serviceClient
    .from("sima_abacus_payments")
    .select("id, amount_ngn, verified_at")
    .eq("payer_email", normalizedEmail)
    .or(activePeriodFilter())
    .limit(1)
    .maybeSingle()

  if (byEmail.error) throw new Error("Unable to check SIMA course access.")
  if (byEmail.data) return byEmail.data

  const enrollment = await serviceClient
    .from("program_enrollments")
    .select("id, amount_ngn, paid_at")
    .eq("email", normalizedEmail)
    .eq("program_id", "sima-abacus")
    .eq("payment_status", "successful")
    .or(activePeriodFilter())
    .limit(1)
    .maybeSingle()

  if (enrollment.error) throw new Error("Unable to check SIMA course access.")
  return enrollment.data
    ? { id: enrollment.data.id, amount_ngn: enrollment.data.amount_ngn, verified_at: enrollment.data.paid_at }
    : null
}

import "server-only"

import { randomInt } from "node:crypto"
import { createServiceClient } from "@/lib/supabase/server"
import type { AdminReferralCode, ReferralCheckReason } from "@/lib/referral-types"

const CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/
const GENERATED_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const code = raw.trim().toUpperCase()
  return CODE_PATTERN.test(code) ? code : null
}

export function generateReferralCode(length = 8) {
  let code = ""
  for (let index = 0; index < length; index += 1) {
    code += GENERATED_ALPHABET[randomInt(GENERATED_ALPHABET.length)]
  }
  return code
}

export async function checkReferralCode(
  raw: unknown,
): Promise<{ valid: true } | { valid: false; reason: ReferralCheckReason }> {
  const code = normalizeReferralCode(raw)
  if (!code) return { valid: false, reason: "invalid" }

  const service = createServiceClient()
  const { data: row } = await service
    .from("referral_codes")
    .select("id, is_active, max_uses, expires_at")
    .ilike("code", code)
    .maybeSingle()

  if (!row) return { valid: false, reason: "invalid" }
  if (!row.is_active) return { valid: false, reason: "inactive" }
  if (row.expires_at && Date.parse(row.expires_at) <= Date.now()) return { valid: false, reason: "expired" }

  if (row.max_uses !== null) {
    const { count } = await service
      .from("referral_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("code_id", row.id)
    if ((count ?? 0) >= row.max_uses) return { valid: false, reason: "limit_reached" }
  }
  return { valid: true }
}

export async function redeemReferralCode(input: {
  code: unknown
  email: string
  productId: string
  txRef: string
}): Promise<string> {
  const code = normalizeReferralCode(input.code)
  if (!code || !input.email) return "invalid"
  const service = createServiceClient()
  const { data, error } = await service.rpc("redeem_referral_code", {
    p_code: code,
    p_email: input.email,
    p_product_id: input.productId,
    p_tx_ref: input.txRef,
  })
  if (error) return "error"
  return typeof data === "string" ? data : "error"
}

export async function getAdminReferralCodes(): Promise<AdminReferralCode[]> {
  const service = createServiceClient()
  const [codesResult, redemptionsResult] = await Promise.all([
    service
      .from("referral_codes")
      .select("id, code, label, max_uses, expires_at, is_active, created_at")
      .order("created_at", { ascending: false }),
    service
      .from("referral_redemptions")
      .select("code_id, email, product_id, redeemed_at")
      .order("redeemed_at", { ascending: false }),
  ])

  const redemptionsByCode = new Map<string, AdminReferralCode["redemptions"]>()
  for (const row of redemptionsResult.data ?? []) {
    const list = redemptionsByCode.get(row.code_id) ?? []
    list.push({ email: row.email, productId: row.product_id, redeemedAt: row.redeemed_at })
    redemptionsByCode.set(row.code_id, list)
  }

  return (codesResult.data ?? []).map((row) => {
    const redemptions = redemptionsByCode.get(row.id) ?? []
    return {
      id: row.id,
      code: row.code,
      label: row.label,
      maxUses: row.max_uses,
      expiresAt: row.expires_at,
      isActive: row.is_active,
      createdAt: row.created_at,
      uses: redemptions.length,
      redemptions,
    }
  })
}

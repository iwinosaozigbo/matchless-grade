export type ReferralRedemption = {
  email: string
  productId: string | null
  redeemedAt: string
}

export type AdminReferralCode = {
  id: string
  code: string
  label: string | null
  maxUses: number | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  uses: number
  redemptions: ReferralRedemption[]
}

export type ReferralCheckReason = "invalid" | "inactive" | "expired" | "limit_reached"

export const SITE_NAME = "MatchlessGrade"

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://matchlessgrade.com").replace(/\/$/, "")

const rawWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""

/** Digits only, international format without "+", e.g. 2348012345678. Empty when not configured. */
export const WHATSAPP_NUMBER = rawWhatsApp.replace(/\D/g, "")

export const WHATSAPP_PREFILL = "Hi, I'd like to know more about MatchlessGrade"

export function whatsappLink(text: string = WHATSAPP_PREFILL): string | null {
  if (!WHATSAPP_NUMBER) return null
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export const FREE_TEST_HREF = "/diagnostic"

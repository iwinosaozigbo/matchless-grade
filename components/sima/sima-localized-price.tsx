"use client"

import useSWR from "swr"
import { formatNgn } from "@/lib/program-pricing"

export type LocalizedSimaPriceData = {
  amountNgn: number
  amount: number
  currency: string
  countryCode: string
  formatted: string
  rateDate: string | null
}

async function fetchLocalizedPrice(url: string): Promise<LocalizedSimaPriceData> {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error("Unable to load SIMA Abacus pricing.")
  return response.json() as Promise<LocalizedSimaPriceData>
}

export function SimaLocalizedPrice({
  amountNgn,
  className = "font-sans text-4xl font-bold text-foreground",
}: {
  amountNgn: number
  className?: string
}) {
  const { data } = useSWR<LocalizedSimaPriceData>(
    `/api/sima-abacus/quote?amountNgn=${amountNgn}`,
    fetchLocalizedPrice,
    { revalidateOnFocus: false, keepPreviousData: true },
  )
  const matchesAmount = data?.amountNgn === amountNgn
  const price = matchesAmount
    ? `${data.currency === "NGN" ? "" : "≈ "}${data.formatted}`
    : formatNgn(amountNgn)

  return <span className={`${className} whitespace-nowrap`}>{price}</span>
}

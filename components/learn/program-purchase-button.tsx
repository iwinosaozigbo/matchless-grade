"use client"

import { useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { ArrowRight, LoaderCircle } from "lucide-react"
import type { ProgramId } from "@/lib/program-pricing"
import { formatNgn } from "@/lib/program-pricing"
import { fetchMonthlyPlan } from "@/lib/flutterwave-client"

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: {
      public_key: string
      tx_ref: string
      amount: number
      currency: string
      payment_options: string
      payment_plan?: number
      customer: { email: string; name?: string; phone_number?: string }
      customizations: { title: string; description: string }
      callback: (response: { transaction_id?: string | number }) => void
      onclose: () => void
    }) => { close: () => void }
  }
}

export function ProgramPurchaseButton({
  email,
  productId,
  productName,
  amountNgn,
}: {
  email: string
  productId: ProgramId
  productName: string
  amountNgn: number
}) {
  const router = useRouter()
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.FlutterwaveCheckout),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function verifyPayment(transactionId: string | number, txRef: string) {
    try {
      const response = await fetch("/api/flutterwave/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: transactionId,
          tx_ref: txRef,
          productId,
          email,
          purchaseSource: "learn",
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.verified) {
        setError(result.error || "We couldn't confirm your payment. Please try again.")
        setBusy(false)
        return
      }
      router.replace("/learn?payment=confirmed")
      router.refresh()
    } catch {
      setError("Something went wrong verifying your payment. Please try again.")
      setBusy(false)
    }
  }

  async function startCheckout() {
    setError("")
    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY?.trim()
    const checkoutFn = window.FlutterwaveCheckout
    if (!publicKey || !checkoutFn) {
      setError(
        scriptReady
          ? "Secure checkout is not available right now. Please try again later."
          : "Secure checkout is still loading. Wait a moment and try again.",
      )
      return
    }

    const txRef = `sp-${productId}-${Date.now()}-${crypto.randomUUID()}`
    let verifying = false
    setBusy(true)

    let plan: { planId: number; amountNgn: number }
    try {
      plan = await fetchMonthlyPlan(productId)
    } catch (planError) {
      setError(planError instanceof Error ? planError.message : "Monthly checkout is not available right now.")
      setBusy(false)
      return
    }

    checkoutFn({
      public_key: publicKey,
      tx_ref: txRef,
      amount: plan.amountNgn,
      currency: "NGN",
      payment_options: "card",
      payment_plan: plan.planId,
      customer: { email },
      customizations: {
        title: productName,
        description: `${productName} monthly subscription — ${formatNgn(plan.amountNgn)}/month`,
      },
      callback: (result) => {
        verifying = true
        void verifyPayment(result.transaction_id ?? "", txRef)
      },
      onclose: () => {
        if (!verifying) setBusy(false)
      },
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-display font-bold text-brand-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <ArrowRight className="size-5" aria-hidden="true" />}
        {busy ? "Processing…" : `Subscribe · ${formatNgn(amountNgn)}/month`}
      </button>
      {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
      <p className="text-center text-xs text-muted-foreground">Monthly recurring payment, charged automatically to your card each month. Secure checkout through Flutterwave.</p>
    </div>
  )
}

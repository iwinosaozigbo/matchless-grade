import { NextResponse } from "next/server"
import { getProgram, getProgramPriceNgn, isProgramId } from "@/lib/program-pricing"
import { nextPeriodEnd } from "@/lib/subscription"
import { redeemReferralCode } from "@/lib/referrals"
import { createClient, createServiceClient } from "@/lib/supabase/server"

// Verifies a Flutterwave transaction server-side before we grant lesson access.
// Never trust the client callback alone — re-check status, amount, and currency here.
export async function POST(req: Request) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY

  let transactionId: string | number | undefined
  let txRef: string | undefined
  let productId: unknown
  let payerEmail: string | undefined
  let purchaseSource: unknown
  let referralCode: unknown
  try {
    const body = await req.json()
    transactionId = body?.transaction_id
    txRef = body?.tx_ref
    productId = body?.productId
    payerEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined
    purchaseSource = body?.purchaseSource
    referralCode = body?.referralCode
  } catch {
    return NextResponse.json({ verified: false, error: "Invalid request body." }, { status: 400 })
  }

  if (!isProgramId(productId)) {
    return NextResponse.json({ verified: false, error: "Choose a valid program." }, { status: 400 })
  }
  if (purchaseSource !== undefined && purchaseSource !== "learn") {
    return NextResponse.json({ verified: false, error: "Invalid purchase source." }, { status: 400 })
  }
  const isLearnPurchase = purchaseSource === "learn"
  const program = getProgram(productId)!
  if (typeof txRef !== "string" || !txRef.trim()) {
    return NextResponse.json({ verified: false, error: "Missing transaction reference." }, { status: 400 })
  }
  if (!txRef.startsWith(`sp-${productId}-`)) {
    return NextResponse.json({ verified: false, error: "Product does not match the transaction." }, { status: 400 })
  }

  if (productId === "sima-abacus" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail ?? "")) {
    return NextResponse.json({ verified: false, error: "Enter the email used for SIMA Abacus checkout." }, { status: 400 })
  }

  // Referral codes are optional and must never block a verified payment.
  async function redeemIfProvided() {
    if (!referralCode || !payerEmail || typeof txRef !== "string") return
    try {
      await redeemReferralCode({ code: referralCode, email: payerEmail, productId: String(productId), txRef })
    } catch {}
  }

  let learnBuyerId: string | null = null
  if (isLearnPurchase) {
    const fetchSite = req.headers.get("sec-fetch-site")
    const origin = req.headers.get("origin")
    const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0].trim()
    const requestHost = forwardedHost ?? req.headers.get("host")
    if (fetchSite && fetchSite !== "same-origin") {
      return NextResponse.json({ verified: false, error: "Request origin is not allowed." }, { status: 403 })
    }
    if (origin) {
      try {
        if (new URL(origin).host !== requestHost) {
          return NextResponse.json({ verified: false, error: "Request origin is not allowed." }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ verified: false, error: "Request origin is not allowed." }, { status: 403 })
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail ?? "")) {
      return NextResponse.json({ verified: false, error: "Your account email is required for checkout." }, { status: 400 })
    }
    const authClient = await createClient()
    const { data: authData } = await authClient.auth.getUser()
    const accountEmail = authData.user?.email?.trim().toLowerCase()
    if (!authData.user || !accountEmail) {
      return NextResponse.json({ verified: false, error: "Sign in before purchasing a course." }, { status: 401 })
    }
    if (accountEmail !== payerEmail) {
      return NextResponse.json({ verified: false, error: "Use the email address on your signed-in account." }, { status: 403 })
    }
    learnBuyerId = authData.user.id
  }

  // SIMA access is never granted by the demo path; a real server-verified payment is required.
  if (!secret) {
    if (isLearnPurchase) {
      return NextResponse.json({ verified: false, error: "Secure payment verification is not configured yet." }, { status: 503 })
    }
    if (productId === "sima-abacus") {
      return NextResponse.json({ verified: false, error: "Secure payment verification is not configured yet." }, { status: 503 })
    }
    await redeemIfProvided()
    return NextResponse.json({ verified: true, demo: true })
  }

  if (!transactionId) {
    return NextResponse.json({ verified: false, error: "Missing transaction_id." }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(transactionId))}/verify`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      },
    )
    const data = await res.json()
    const tx = data?.data
    const transactionTimestamp = typeof tx?.created_at === "string" ? Date.parse(tx.created_at) : Date.now()
    const pricingTimestamp = Number.isFinite(transactionTimestamp) ? transactionTimestamp : Date.now()
    const expectedAmount = getProgramPriceNgn(program, pricingTimestamp)

    const verified =
      data?.status === "success" &&
      tx?.status === "successful" &&
      tx?.currency === "NGN" &&
      Number(tx?.amount) === expectedAmount &&
      tx?.tx_ref === txRef

    if (!verified) {
      return NextResponse.json({ verified: false, error: "Payment could not be verified." }, { status: 402 })
    }

    if (isLearnPurchase) {
      const verifiedEmail = typeof tx?.customer?.email === "string" ? tx.customer.email.trim().toLowerCase() : ""
      if (!verifiedEmail || verifiedEmail !== payerEmail) {
        return NextResponse.json({ verified: false, error: "The payment email does not match your signed-in account." }, { status: 402 })
      }

      const serviceClient = createServiceClient()
      const now = new Date().toISOString()
      const { error: enrollmentError } = await serviceClient.from("program_enrollments").upsert(
        {
          flutterwave_transaction_id: String(transactionId),
          tx_ref: txRef,
          email: verifiedEmail,
          customer_name: tx?.customer?.name ?? null,
          program_id: productId,
          amount_ngn: expectedAmount,
          currency: "NGN",
          payment_status: "successful",
          paid_at: typeof tx?.created_at === "string" ? tx.created_at : now,
          assigned_by: learnBuyerId,
          subscription_status: "active",
          current_period_end: nextPeriodEnd(typeof tx?.created_at === "string" ? tx.created_at : now),
          updated_at: now,
        },
        { onConflict: "flutterwave_transaction_id" },
      )
      if (enrollmentError) {
        return NextResponse.json(
          { verified: false, error: "Payment was confirmed, but course access could not be saved. Do not pay again; contact support with your transaction reference." },
          { status: 500 },
        )
      }
    }

    if (productId === "sima-abacus") {
      const verifiedEmail = typeof tx?.customer?.email === "string" ? tx.customer.email.trim().toLowerCase() : ""
      if (!verifiedEmail || verifiedEmail !== payerEmail) {
        return NextResponse.json({ verified: false, error: "The payment email does not match the SIMA account email." }, { status: 402 })
      }

      const authClient = await createClient()
      const { data: authData } = await authClient.auth.getUser()
      const userId = authData.user && authData.user.email?.toLowerCase() === verifiedEmail ? authData.user.id : null
      const serviceClient = createServiceClient()
      const { error: saveError } = await serviceClient.from("sima_abacus_payments").upsert(
        {
          user_id: userId,
          flutterwave_transaction_id: String(transactionId),
          tx_ref: txRef,
          payer_email: verifiedEmail,
          product_id: "sima-abacus",
          amount_ngn: expectedAmount,
          currency: "NGN",
          current_period_end: nextPeriodEnd(typeof tx?.created_at === "string" ? tx.created_at : undefined),
        },
        { onConflict: "flutterwave_transaction_id", ignoreDuplicates: true },
      )

      if (saveError) {
        return NextResponse.json(
          { verified: false, error: "Payment was confirmed, but course access could not be saved. Do not pay again; contact support with your transaction reference." },
          { status: 500 },
        )
      }

      const { data: savedPayment, error: readError } = await serviceClient
        .from("sima_abacus_payments")
        .select("id, user_id, tx_ref, payer_email, amount_ngn")
        .eq("flutterwave_transaction_id", String(transactionId))
        .maybeSingle()

      if (
        readError ||
        !savedPayment ||
        savedPayment.tx_ref !== txRef ||
        savedPayment.payer_email !== verifiedEmail ||
        savedPayment.amount_ngn !== expectedAmount
      ) {
        return NextResponse.json(
          { verified: false, error: "Payment was confirmed, but course access could not be saved. Do not pay again; contact support with your transaction reference." },
          { status: 500 },
        )
      }

      if (userId && !savedPayment.user_id) {
        await serviceClient.from("sima_abacus_payments").update({ user_id: userId }).eq("id", savedPayment.id).is("user_id", null)
      }
    }

    await redeemIfProvided()
    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ verified: false, error: "Verification request failed." }, { status: 502 })
  }
}

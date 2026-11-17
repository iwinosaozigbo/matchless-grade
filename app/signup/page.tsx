"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import type { LocalizedSimaPriceData } from "@/components/sima/sima-localized-price"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { AtSign, Check, Clock, Gift, GraduationCap, Loader2, Lock, Mail, Phone, School, ShieldCheck, Sparkles, User, Users } from "lucide-react"
import { useGame, type SignupProfile } from "@/lib/game-store"
import { createClient as createSupabaseClient } from "@/lib/supabase/client"
import { FloatingShapes } from "@/components/floating-shapes"
import { fetchMonthlyPlan } from "@/lib/flutterwave-client"
import {
  formatNgn,
  getProgram,
  getProgramPriceNgn,
  isEarlyBird,
  isProgramId,
  LAUNCH_DATE,
  PROGRAMS,
  type ProgramId,
} from "@/lib/program-pricing"

async function fetchSimaPrice(url: string): Promise<LocalizedSimaPriceData> {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error("Unable to load local-currency pricing.")
  return response.json() as Promise<LocalizedSimaPriceData>
}

const PERKS = [
  "Every subject, every lesson unlocked",
  "Quizzes, flashcards & XP progress",
  "Badges, streaks and the leaderboard",
]

const SIMA_PERKS = [
  "40 Basic 1 video lessons",
  "13 weekly releases plus summary class",
  "Practice quizzes, XP and saved progress",
]

const AGE_GROUPS = [
  { value: "1-5", label: "Ages 1–5 (Early years)" },
  { value: "6-12", label: "Ages 6–12 (Primary)" },
  { value: "13-17", label: "Ages 13–17 (Secondary)" },
  { value: "18+", label: "18 and above" },
]

const GRADE_LEVELS = [
  "Pre-school",
  "Primary 1–3",
  "Primary 4–6",
  "JSS 1–3 (Junior Secondary)",
  "SSS 1–3 (Senior Secondary)",
  "Tertiary / Other",
]

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  username: string
  password: string
  confirmPassword: string
  ageGroup: string
  gradeLevel: string
  school: string
  guardianName: string
  guardianPhone: string
  productId: ProgramId
  referralCode: string
  agree: boolean
}

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  confirmPassword: "",
  ageGroup: "",
  gradeLevel: "",
  school: "",
  guardianName: "",
  guardianPhone: "",
  productId: "mathematics",
  referralCode: "",
  agree: false,
}

export default function SignupPage() {
  const router = useRouter()
  const { completeSignup } = useGame()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // Tick every second so the countdown stays live and price flips at launch.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    const params = new URLSearchParams(window.location.search)
    const requestedProduct = params.get("product")
    const requestedReferral = params.get("ref")?.trim().toUpperCase().slice(0, 32) ?? ""
    if (isProgramId(requestedProduct)) {
      setForm((current) => ({ ...current, productId: requestedProduct }))
    }
    if (requestedReferral) {
      setForm((current) => ({ ...current, referralCode: requestedReferral }))
    }
    return () => clearInterval(id)
  }, [])

  const earlyBird = isEarlyBird(now)
  const selectedProduct = getProgram(form.productId)!
  const priceNgn = getProgramPriceNgn(selectedProduct, now)
  const isOneTime = form.productId === "sima-abacus"
  const { data: simaPrice } = useSWR<LocalizedSimaPriceData>(
    isOneTime ? `/api/sima-abacus/quote?amountNgn=${priceNgn}` : null,
    fetchSimaPrice,
    { revalidateOnFocus: false },
  )
  function formatProgramPrice(amountNgn: number) {
    if (!isOneTime || !simaPrice || simaPrice.amountNgn !== priceNgn) return formatNgn(amountNgn)
    if (simaPrice.currency === "NGN") return simaPrice.formatted
    const rate = simaPrice.amount / simaPrice.amountNgn
    if (!Number.isFinite(rate) || rate <= 0) return formatNgn(amountNgn)
    try {
      const maximumFractionDigits = new Intl.NumberFormat("en", {
        style: "currency",
        currency: simaPrice.currency,
      }).resolvedOptions().maximumFractionDigits ?? 2
      const precision = 10 ** maximumFractionDigits
      const localAmount = Math.round((amountNgn * rate + Number.EPSILON) * precision) / precision
      const locale = new Intl.Locale("en", { region: simaPrice.countryCode }).toString()
      const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: simaPrice.currency,
        maximumFractionDigits,
      }).format(localAmount)
      return `≈ ${formatted}`
    } catch {
      return formatNgn(amountNgn)
    }
  }
  const priceLabel = formatProgramPrice(priceNgn)
  const isForeignCurrency = Boolean(simaPrice && simaPrice.amountNgn === priceNgn && simaPrice.currency !== "NGN")
  const localCurrencyNotice = isForeignCurrency
    ? `Approximate local-currency display. Checkout is processed in NGN (${formatNgn(priceNgn)}).`
    : ""
  const remaining = new Date(LAUNCH_DATE).getTime() - now
  const isMinor = form.ageGroup === "1-5" || form.ageGroup === "6-12" || form.ageGroup === "13-17"

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const required: [keyof FormState, string][] = [
      ["firstName", "first name"],
      ["lastName", "last name"],
      ["email", "email address"],
      ["phone", "phone number"],
      ["username", "username"],
      ["password", "password"],
      ["ageGroup", "age group"],
      ["gradeLevel", "class / grade level"],
    ]
    for (const [key, label] of required) {
      if (!String(form[key]).trim()) {
        setError(`Please provide your ${label}.`)
        return false
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.")
      return false
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return false
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return false
    }
    if (isMinor && !form.guardianName.trim()) {
      setError("Please add a parent or guardian's name for this age group.")
      return false
    }
    if (!form.agree) {
      setError("Please accept the terms to continue.")
      return false
    }
    return true
  }

  function buildProfile(): SignupProfile {
    return {
      username: form.username.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ageGroup: form.ageGroup,
      gradeLevel: form.gradeLevel,
      school: form.school.trim(),
      guardianName: form.guardianName.trim(),
      guardianPhone: form.guardianPhone.trim(),
      productId: form.productId,
    }
  }

  async function prepareSimaAccount() {
    const supabase = createSupabaseClient()
    const email = form.email.trim().toLowerCase()
    const { data: currentData } = await supabase.auth.getUser()

    if (currentData.user?.email?.toLowerCase() === email) return true
    if (currentData.user) await supabase.auth.signOut()

    const res = await fetch("/api/sima-abacus/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
      }),
    })
    const result = (await res.json().catch(() => ({}))) as { exists?: boolean; error?: string }
    if (!res.ok) throw new Error(result.error || "We couldn't create your account. Please try again.")

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    })
    if (signInError || !signInData.session) {
      throw new Error(
        result.exists
          ? "This email already has an account. Sign in to SIMA Abacus with your existing password, or use another email."
          : "Your account was created but we couldn't sign you in. Please sign in to continue.",
      )
    }
    return true
  }

  async function verifyAndFinish(transaction_id: string | number, tx_ref: string) {
    try {
      const res = await fetch("/api/flutterwave/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id,
          tx_ref,
          productId: form.productId,
          email: form.email.trim().toLowerCase(),
          referralCode: form.referralCode.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.verified) {
        if (form.productId === "sima-abacus") {
          router.push("/learn?payment=confirmed")
          return
        }
        completeSignup(buildProfile())
        router.push("/learn")
      } else {
        setError(data.error || "We couldn't confirm your payment. Please contact support.")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong verifying your payment. Please try again.")
      setLoading(false)
    }
  }

  async function checkReferral() {
    const code = form.referralCode.trim()
    if (!code) return true
    try {
      const res = await fetch("/api/referral-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const result = (await res.json().catch(() => ({}))) as { valid?: boolean; message?: string }
      if (result.valid) return true
      setError(result.message || "That referral code isn't valid. Fix it or clear the field to continue.")
      return false
    } catch {
      setError("We couldn't check your referral code. Try again, or clear the field to continue.")
      return false
    }
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!validate()) return

    setLoading(true)
    if (!(await checkReferral())) {
      setLoading(false)
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY?.trim()
    setLoading(true)

    if (isOneTime && (!publicKey || !window.FlutterwaveCheckout)) {
      setError("Secure SIMA Abacus checkout is not available right now. Please try again later.")
      setLoading(false)
      return
    }

    if (isOneTime) {
      try {
        await prepareSimaAccount()
      } catch (error) {
        setError(error instanceof Error ? error.message : "We couldn't prepare your SIMA account. Please try again.")
        setLoading(false)
        return
      }
    }

    const txRef = `sp-${form.productId}-${Date.now()}-${form.username.trim().toLowerCase()}`

    // Other programs retain their existing demo behavior when Flutterwave is not configured.
    if (!publicKey || !window.FlutterwaveCheckout) {
      void verifyAndFinish(`demo-${txRef}`, txRef)
      return
    }

    let plan: { planId: number; amountNgn: number }
    try {
      plan = await fetchMonthlyPlan(form.productId)
    } catch (planError) {
      setError(planError instanceof Error ? planError.message : "Monthly checkout is not available right now.")
      setLoading(false)
      return
    }

    window.FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: txRef,
      amount: plan.amountNgn,
      currency: "NGN",
      payment_options: "card",
      payment_plan: plan.planId,
      customer: {
        email: form.email.trim(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        phone_number: form.phone.trim(),
      },
      customizations: {
        title: selectedProduct.name,
        description: isOneTime
          ? `SIMA Abacus Basic 1 monthly subscription — ${formatNgn(plan.amountNgn)}/month`
          : `${selectedProduct.name} tutoring monthly subscription — ${formatNgn(plan.amountNgn)}/month`,
      },
      callback: (response: { transaction_id?: string | number }) => {
        void verifyAndFinish(response.transaction_id ?? "", txRef)
      },
      onclose: () => setLoading(false),
    })
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background bg-dots text-foreground">
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <FloatingShapes />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pt-12 text-center">
        <h1 className="text-balance font-display text-[2.5rem] font-bold leading-[1.05] text-foreground">
          Create your account
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
          {isOneTime ? (
            <>Create your account, then subscribe at {priceLabel}/month to unlock SIMA Abacus Basic 1. Billed monthly until you cancel.</>
          ) : (
            <>
              Choose a program for the learner. {" "}
              {earlyBird ? (
                <>
                  {selectedProduct.name} is <span className="font-sans font-bold text-foreground">{priceLabel}</span>{" "}/month during early bird.
                </>
              ) : (
                <>
                  {selectedProduct.name} is <span className="font-sans font-bold text-foreground">{priceLabel}</span>{" "}/month.
                </>
              )}
            </>
          )}
        </p>

        {earlyBird && (
          <div className="mx-auto mt-6 w-full max-w-md rounded-3xl border-2 border-sun/50 bg-sun/10 p-4 text-left shadow-toy-sun/40">
            <div className="flex items-center gap-2 text-sm font-display font-bold uppercase tracking-wide text-sun-foreground/90">
              <Sparkles className="h-4 w-4 text-sun" />
              Early-bird offer ends in
            </div>
            <Countdown ms={remaining} />
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/80">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-bold text-foreground">{formatProgramPrice(selectedProduct.earlyBirdPriceNgn)}/month</span>{" "}
                now — jumps to{" "}
                <span className="font-bold text-foreground">{formatProgramPrice(selectedProduct.launchPriceNgn)}/month</span> at
                launch.
              </span>
            </p>
          </div>
        )}

        <ul className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {(isOneTime ? SIMA_PERKS : PERKS).map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm font-medium text-foreground/85">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Check className="h-3.5 w-3.5" />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mx-auto mt-8 w-full max-w-2xl rounded-t-[2.75rem] border-t-2 border-border bg-card px-6 pb-10 pt-8 text-card-foreground shadow-[0_-14px_50px_-20px_rgba(47,107,255,0.35)] sm:px-10">
        <form onSubmit={handlePay} className="flex flex-col gap-7">
          <Section title="Choose your program" icon={<Sparkles className="h-4 w-4" />}>
            <SelectField
              label="Tutoring program"
              value={form.productId}
              onChange={(value) => {
                if (isProgramId(value)) set("productId", value)
              }}
              placeholder="Select a program"
              options={PROGRAMS.map((program) => ({ value: program.id, label: program.name }))}
            />
            <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
          </Section>

          <Section title="Learner details" icon={<User className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="First name"
                value={form.firstName}
                onChange={(v) => set("firstName", v)}
                placeholder="Ada"
                autoComplete="given-name"
              />
              <Field
                label="Last name"
                value={form.lastName}
                onChange={(v) => set("lastName", v)}
                placeholder="Okoro"
                autoComplete="family-name"
              />
              <Field
                label="Email address"
                type="email"
                icon={<Mail className="h-5 w-5 text-muted-foreground" />}
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="you@email.com"
                autoComplete="email"
              />
              <Field
                label="Phone number"
                type="tel"
                icon={<Phone className="h-5 w-5 text-muted-foreground" />}
                value={form.phone}
                onChange={(v) => set("phone", v)}
                placeholder="080…"
                autoComplete="tel"
              />
            </div>
          </Section>

          <Section title="Class & school" icon={<GraduationCap className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Age group"
                value={form.ageGroup}
                onChange={(v) => set("ageGroup", v)}
                placeholder="Select age group"
                options={AGE_GROUPS}
              />
              <SelectField
                label="Class / grade level"
                value={form.gradeLevel}
                onChange={(v) => set("gradeLevel", v)}
                placeholder="Select class level"
                options={GRADE_LEVELS.map((g) => ({ value: g, label: g }))}
              />
              <div className="sm:col-span-2">
                <Field
                  label="School (optional)"
                  icon={<School className="h-5 w-5 text-muted-foreground" />}
                  value={form.school}
                  onChange={(v) => set("school", v)}
                  placeholder="Name of school"
                />
              </div>
            </div>
          </Section>

          {isMinor && (
            <Section title="Parent / guardian" icon={<Users className="h-4 w-4" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Guardian name"
                  value={form.guardianName}
                  onChange={(v) => set("guardianName", v)}
                  placeholder="Parent or guardian"
                  autoComplete="name"
                />
                <Field
                  label="Guardian phone (optional)"
                  type="tel"
                  icon={<Phone className="h-5 w-5 text-muted-foreground" />}
                  value={form.guardianPhone}
                  onChange={(v) => set("guardianPhone", v)}
                  placeholder="080…"
                  autoComplete="tel"
                />
              </div>
            </Section>
          )}

          <Section title="Login details" icon={<Lock className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Username"
                  icon={<AtSign className="h-5 w-5 text-muted-foreground" />}
                  value={form.username}
                  onChange={(v) => set("username", v)}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>
              <Field
                label="Password"
                type="password"
                icon={<Lock className="h-5 w-5 text-muted-foreground" />}
                value={form.password}
                onChange={(v) => set("password", v)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <Field
                label="Confirm password"
                type="password"
                icon={<Lock className="h-5 w-5 text-muted-foreground" />}
                value={form.confirmPassword}
                onChange={(v) => set("confirmPassword", v)}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>
          </Section>

          <Section title="Referral code" icon={<Gift className="h-4 w-4" />}>
            <Field
              label="Referral code (optional)"
              icon={<Gift className="h-5 w-5 text-muted-foreground" />}
              value={form.referralCode}
              onChange={(v) => set("referralCode", v.toUpperCase().replace(/\s/g, ""))}
              placeholder="Have a code? Enter it here"
              maxLength={32}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </Section>

          <label className="flex items-start gap-3 text-sm font-medium text-foreground/85">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => set("agree", e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-border accent-brand"
            />
            <span>
              I agree to the Terms of Service and Privacy Policy, and confirm the details above are correct.
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>
          )}

          <div className="border-t-2 border-border pt-5">
            <button
              type="submit"
              disabled={loading || !scriptReady}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-sun px-6 py-4 font-display text-lg font-bold text-sun-foreground shadow-toy-sun transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              {loading ? (isOneTime ? "Creating account & opening checkout…" : "Processing…") : isOneTime ? <>Create account &amp; subscribe · <span className="font-sans">{priceLabel}</span>/month</> : <>Subscribe · <span className="font-sans">{priceLabel}</span>/month for {selectedProduct.name}</>}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {isOneTime
                ? `Monthly recurring payment, charged automatically to your card each month until you cancel. Your account is created first, then secure checkout opens here. ${localCurrencyNotice}`
                : `Monthly recurring payment, charged automatically to your card each month until you cancel. Secured by Flutterwave. ${isForeignCurrency ? localCurrencyNotice : ""}`}
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={isOneTime ? "/login?next=%2Flearn%3Fpurchase%3Dsima-abacus" : "/login"} className="font-display font-bold text-foreground hover:text-brand">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

function Countdown({ ms }: { ms: number }) {
  const clamped = Math.max(0, ms)
  const totalSeconds = Math.floor(clamped / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = [
    { label: "Days", value: days },
    { label: "Hrs", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ]

  return (
    <div className="mt-2 flex items-stretch gap-2">
      {parts.map((p) => (
        <div
          key={p.label}
          className="flex flex-1 flex-col items-center rounded-2xl border-2 border-border bg-card px-1 py-2"
        >
          <span className="font-display text-2xl font-bold tabular-nums text-foreground">
            {String(p.value).padStart(2, "0")}
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">{p.label}</span>
        </div>
      ))}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 text-brand">{icon}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  icon,
  value,
  onChange,
  ...props
}: {
  label: string
  icon?: React.ReactNode
  value: string
  onChange: (v: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-secondary/40 px-4 py-3 focus-within:border-brand">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
          {...props}
        />
      </div>
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center rounded-2xl border-2 border-border bg-secondary/40 px-4 py-3 focus-within:border-brand">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-semibold outline-none"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-card text-card-foreground">
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}

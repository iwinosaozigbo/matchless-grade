"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

type Kind = "diagnostic" | "school" | "employer" | "contact"

const CLASS_OPTIONS = [
  "Nursery 2",
  "Basic 1",
  "Basic 2",
  "Basic 3",
  "Basic 4",
  "Basic 5",
  "Basic 6",
  "JSS1",
  "JSS2",
  "JSS3",
  "SSS1",
  "SSS2",
  "SSS3",
]

const inputClass =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"

type Props = {
  kind: Kind
  submitLabel: string
  successTitle: string
  successBody: string
  organisationLabel?: string
  showClass?: boolean
  showMessage?: boolean
}

export function LeadForm({
  kind,
  submitLabel,
  successTitle,
  successBody,
  organisationLabel,
  showClass,
  showMessage,
}: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setStatus("sending")
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, kind }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.")
      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-[2rem] border-2 border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-bold">{successTitle}</h2>
        <p className="mt-2 text-muted-foreground">{successBody}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-[2rem] border-2 border-border bg-card p-6 shadow-soft sm:p-8"
    >
      <div>
        <label htmlFor="lead-name" className="mb-1.5 block text-sm font-semibold">
          {kind === "diagnostic" ? "Parent's name" : "Your name"}
        </label>
        <input id="lead-name" name="name" required maxLength={120} autoComplete="name" className={inputClass} />
      </div>

      {organisationLabel && (
        <div>
          <label htmlFor="lead-org" className="mb-1.5 block text-sm font-semibold">
            {organisationLabel}
          </label>
          <input id="lead-org" name="organisation" required maxLength={160} className={inputClass} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-phone" className="mb-1.5 block text-sm font-semibold">
            WhatsApp number
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="0801 234 5678"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lead-email" className="mb-1.5 block text-sm font-semibold">
            Email
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={200}
            className={inputClass}
          />
        </div>
      </div>

      {showClass && (
        <div>
          <label htmlFor="lead-class" className="mb-1.5 block text-sm font-semibold">
            Your child&apos;s class
          </label>
          <select id="lead-class" name="childClass" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select a class
            </option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {showMessage && (
        <div>
          <label htmlFor="lead-message" className="mb-1.5 block text-sm font-semibold">
            Anything we should know? <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea id="lead-message" name="message" rows={3} maxLength={1000} className={inputClass} />
        </div>
      )}

      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <p className="text-xs text-muted-foreground">Provide a WhatsApp number or an email so we can reach you.</p>

      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-3.5 font-display text-base font-bold text-sun-foreground shadow-toy transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {status === "sending" && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
        {submitLabel}
      </button>
    </form>
  )
}

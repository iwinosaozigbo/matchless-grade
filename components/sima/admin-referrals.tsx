"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Gift, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminReferralCode } from "@/lib/referral-types"

const inputClass =
  "h-10 min-w-0 rounded-xl border border-white/10 bg-[#0d1119] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15"

async function send(method: "POST" | "PATCH" | "DELETE", payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/referral-codes", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const result = (await response.json().catch(() => ({}))) as { error?: string; code?: string }
  if (!response.ok) throw new Error(result.error ?? "The request could not be completed.")
  return result
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

function codeStatus(code: AdminReferralCode) {
  if (!code.isActive) return { label: "Disabled", className: "bg-slate-400/10 text-slate-400" }
  if (code.expiresAt && Date.parse(code.expiresAt) <= Date.now()) {
    return { label: "Expired", className: "bg-amber-300/10 text-amber-300" }
  }
  if (code.maxUses !== null && code.uses >= code.maxUses) {
    return { label: "Limit reached", className: "bg-amber-300/10 text-amber-300" }
  }
  return { label: "Active", className: "bg-emerald-400/10 text-emerald-300" }
}

export function ReferralsTab({ codes }: { codes: AdminReferralCode[] }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [label, setLabel] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const totalUses = codes.reduce((sum, item) => sum + item.uses, 0)

  async function run(key: string, action: () => Promise<string>) {
    setBusy(key)
    setMessage(null)
    try {
      const text = await action()
      setMessage({ type: "success", text })
      router.refresh()
      return true
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "The request could not be completed." })
      return false
    } finally {
      setBusy(null)
    }
  }

  async function createCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = await run("create", async () => {
      const result = await send("POST", {
        code,
        label,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
      return `Referral code ${result.code} created.`
    })
    if (ok) {
      setCode("")
      setLabel("")
      setMaxUses("")
      setExpiresAt("")
    }
  }

  async function copyCode(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      setTimeout(() => setCopied((current) => (current === value ? null : current)), 1500)
    } catch {
      setMessage({ type: "error", text: "Could not copy automatically. Select the code and copy it manually." })
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.045] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-200">
            <Gift className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">Create a referral code</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Learners can optionally enter a code on the sign-up page. A code is counted once their payment is confirmed, and each learner email can use only one code. Leave the code blank to generate one automatically.
            </p>
          </div>
        </div>
        <form onSubmit={createCode} className="mt-5 flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              Code (optional)
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={32}
                autoComplete="off"
                placeholder="Auto-generate"
                className={`${inputClass} font-mono uppercase tracking-wider`}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              Label / owner
              <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={120} placeholder="e.g. Ms. Adeyemi's class" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              Usage limit (optional)
              <input type="number" min={1} step={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              Expires (optional)
              <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
            </label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={Boolean(busy)} className="h-10 rounded-xl bg-violet-300 px-4 text-sm font-semibold text-[#1c1630] hover:bg-violet-200">
              {busy === "create" ? "Creating…" : "Create code"}
            </Button>
          </div>
        </form>
      </section>

      {message && (
        <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${message.type === "error" ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}>
          {message.text}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121822]">
        <div className="border-b border-white/[0.07] px-5 py-4">
          <h2 className="text-sm font-semibold text-white">All referral codes</h2>
          <p className="mt-1 text-xs text-slate-500">
            {codes.length} code{codes.length === 1 ? "" : "s"} · {totalUses} redemption{totalUses === 1 ? "" : "s"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Used</th>
                <th className="px-4 py-3 font-semibold">Expires</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {codes.map((item) => {
                const status = codeStatus(item)
                const isOpen = expanded === item.id
                return (
                  <tr key={item.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold tracking-wider text-white">{item.code}</span>
                        <button
                          type="button"
                          onClick={() => copyCode(item.code)}
                          aria-label={`Copy code ${item.code}`}
                          className="grid size-7 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          {copied === item.code ? <Check className="size-3.5 text-emerald-300" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                        </button>
                      </div>
                      {item.label && <p className="mt-1 text-xs text-slate-500">{item.label}</p>}
                      {isOpen && (
                        <ul className="mt-3 space-y-1.5 rounded-xl border border-white/[0.07] bg-[#0d1119] p-3">
                          {item.redemptions.length ? (
                            item.redemptions.map((redemption) => (
                              <li key={redemption.email} className="flex items-center justify-between gap-4 text-xs">
                                <span className="truncate text-slate-300">{redemption.email}</span>
                                <span className="shrink-0 text-slate-500">{formatDate(redemption.redeemedAt)}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-slate-500">No one has used this code yet.</li>
                          )}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                      >
                        {item.uses}
                        {item.maxUses !== null ? ` / ${item.maxUses}` : ""} {isOpen ? "· hide" : "· view"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-300">{formatDate(item.expiresAt)}</td>
                    <td className="px-4 py-4 text-xs text-slate-300">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            run(`toggle:${item.id}`, async () => {
                              await send("PATCH", { id: item.id, isActive: !item.isActive })
                              return `Code ${item.code} ${item.isActive ? "disabled" : "enabled"}.`
                            })
                          }
                          className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] disabled:opacity-60"
                        >
                          {busy === `toggle:${item.id}` ? "Saving…" : item.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          aria-label={`Delete code ${item.code}`}
                          onClick={() => {
                            if (!window.confirm(`Delete code ${item.code}? Its redemption history will be removed too.`)) return
                            void run(`delete:${item.id}`, async () => {
                              await send("DELETE", { id: item.id })
                              return `Code ${item.code} deleted.`
                            })
                          }}
                          className="grid size-7 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-60"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!codes.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    No referral codes yet. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { AlertTriangle, CreditCard, Search } from "lucide-react"
import { PROGRAMS } from "@/lib/program-pricing"
import type { AdminPayment, AdminPaymentProgramSource } from "@/lib/sima/admin-types"

const sourceLabel: Record<AdminPaymentProgramSource, string> = {
  assigned: "Set by admin",
  reference: "From checkout",
  amount: "Guessed from amount",
  unknown: "Needs a bundle",
}

const statusStyle: Record<string, string> = {
  successful: "bg-emerald-400/10 text-emerald-300",
  failed: "bg-rose-400/10 text-rose-300",
  pending: "bg-amber-300/10 text-amber-300",
}

function formatNgn(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date)
}

export function PaymentsTab({ payments, loadError }: { payments: AdminPayment[]; loadError: string | null }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const successful = payments.filter((payment) => payment.status === "successful")
  const revenue = successful.reduce((total, payment) => total + payment.amountNgn, 0)
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return payments
    return payments.filter((payment) =>
      [payment.email, payment.name ?? "", payment.txRef, payment.transactionId].some((value) => value.toLowerCase().includes(needle)),
    )
  }, [payments, query])

  async function changeBundle(payment: AdminPayment, programId: string) {
    if (programId === payment.programId) return
    setBusyId(payment.transactionId)
    setError(null)
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: payment.transactionId, programId }),
      })
      const result = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) throw new Error(result.error ?? "The bundle could not be changed.")
      router.refresh()
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "The bundle could not be changed.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Flutterwave transactions", value: payments.length.toString() },
          { label: "Successful payments", value: successful.length.toString() },
          { label: "Confirmed revenue", value: formatNgn(revenue) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/[0.07] bg-[#121822] p-5">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      {(loadError || error) && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          {error ?? loadError}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121822]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Payments</h2>
            <p className="mt-1 text-xs text-slate-500">Pulled live from Flutterwave. Change the bundle on any successful payment.</p>
          </div>
          <label className="relative">
            <span className="sr-only">Search payments</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Email, name or reference"
              className="h-9 w-64 rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <CreditCard className="size-6 text-slate-600" aria-hidden="true" />
            <p className="text-sm text-slate-400">{payments.length === 0 ? "No Flutterwave transactions yet." : "No payments match your search."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr className="border-b border-white/[0.07]">
                  <th scope="col" className="px-5 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-5 py-3 font-medium">Amount</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium">Date</th>
                  <th scope="col" className="px-5 py-3 font-medium">Bundle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => {
                  const canAssign = payment.status === "successful"
                  return (
                    <tr key={payment.transactionId} className="border-b border-white/[0.05] last:border-0">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{payment.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{payment.email || "No email"}</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-600">
                          #{payment.transactionId} · {payment.txRef}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-white">
                        {payment.currency === "NGN" ? formatNgn(payment.amountNgn) : `${payment.amountNgn} ${payment.currency}`}
                        {payment.paymentType && <p className="text-xs text-slate-500">{payment.paymentType}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[payment.status] ?? "bg-slate-400/10 text-slate-300"}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{formatDate(payment.paidAt)}</td>
                      <td className="px-5 py-4">
                        <label className="sr-only" htmlFor={`bundle-${payment.transactionId}`}>
                          Bundle for {payment.email}
                        </label>
                        <select
                          id={`bundle-${payment.transactionId}`}
                          value={payment.programId ?? ""}
                          disabled={!canAssign || busyId === payment.transactionId}
                          onChange={(event) => changeBundle(payment, event.target.value)}
                          className="h-9 w-48 rounded-lg border border-white/10 bg-[#0d1017] px-2 text-sm text-white focus:border-violet-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {!payment.programId && <option value="">Choose bundle</option>}
                          {PROGRAMS.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.name}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {busyId === payment.transactionId
                            ? "Saving…"
                            : canAssign
                              ? sourceLabel[payment.programSource]
                              : `${sourceLabel[payment.programSource]} · payment not completed`}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { COURSES } from "@/lib/course-catalog"
import type { AdminAccount } from "@/lib/course-access"

const inputClass =
  "h-10 min-w-0 rounded-xl border border-white/10 bg-[#0d1119] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15"

async function send(method: "POST" | "PATCH", payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/accounts", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const result = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) throw new Error(result.error ?? "The request could not be completed.")
}

function formatDate(value: string | null) {
  if (!value) return "Never"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

export function AccountsTab({ accounts }: { accounts: AdminAccount[] }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter((a) => a.email.includes(q) || a.name?.toLowerCase().includes(q))
  }, [accounts, query])

  async function run(key: string, method: "POST" | "PATCH", payload: Record<string, unknown>, success: string) {
    setBusy(key)
    setMessage(null)
    try {
      await send(method, payload)
      setMessage({ type: "success", text: success })
      router.refresh()
      return true
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "The request could not be completed." })
      return false
    } finally {
      setBusy(null)
    }
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleaned = email.trim().toLowerCase()
    const ok = await run("create", "POST", { name, email: cleaned, password }, `Account created for ${cleaned}. They can sign in immediately with access to all ${COURSES.length} courses.`)
    if (ok) {
      setName("")
      setEmail("")
      setPassword("")
    }
  }


  return (
    <>
      <section className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.045] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-200">
            <UserPlus className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">Create a learner account</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              The account is confirmed automatically and gets access to all {COURSES.length} courses as soon as it is created. Share the password you set so the learner can sign in immediately.
            </p>
          </div>
        </div>
        <form onSubmit={createAccount} className="mt-5 flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Ada Obi" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              Email
              <input type="email" required maxLength={254} autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="learner@example.com" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              Password
              <input type="text" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={inputClass} />
            </label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={Boolean(busy)} className="h-10 rounded-xl bg-violet-300 px-4 text-sm font-semibold text-[#1c1630] hover:bg-violet-200">
              {busy === "create" ? "Creating…" : "Create account"}
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">All accounts</h2>
            <p className="mt-1 text-xs text-slate-500">
              {accounts.length} account{accounts.length === 1 ? "" : "s"} · click a course to give or remove access
            </p>
          </div>
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search accounts</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="h-9 w-full rounded-xl border border-white/10 bg-[#0d1119] pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-violet-300/50" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                {COURSES.map((course) => (
                  <th key={course.id} className="px-4 py-3 font-semibold">
                    {course.group === "Mathematics" ? `Maths · ${course.name}` : course.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((account) => (
                <tr key={account.userId} className="align-middle">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-200">{account.name ?? account.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{account.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-300">{formatDate(account.createdAt)}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Last sign-in {formatDate(account.lastSignInAt)}</p>
                  </td>
                  {COURSES.map((course) => {
                    const granted = account.courses[course.id]
                    const locked =
                      account.isAdmin || (course.group === "Mathematics" && account.paidMathBundle)
                    const key = `${account.email}:${course.id}`
                    const note = account.isAdmin
                      ? "Admin"
                      : locked
                        ? "Paid maths bundle"
                        : course.id === "sima-abacus" && account.paidSima
                          ? "Paid"
                          : null
                    return (
                      <td key={course.id} className="px-4 py-4">
                        <button
                          type="button"
                          aria-pressed={granted}
                          aria-label={`${granted ? "Remove" : "Give"} ${course.name} access for ${account.email}`}
                          disabled={locked || Boolean(busy)}
                          onClick={() =>
                            run(key, "PATCH", { email: account.email, courseId: course.id, granted: !granted }, `${course.name} access ${granted ? "removed from" : "given to"} ${account.email}.`)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed ${
                            granted
                              ? "bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                              : "bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] hover:text-slate-300"
                          } ${locked ? "opacity-80" : ""}`}
                        >
                          <span className={`size-1.5 rounded-full ${granted ? "bg-emerald-300" : "bg-slate-600"}`} />
                          {busy === key ? "Saving…" : granted ? "Revoke access" : "Grant access"}
                        </button>
                        {note && <p className="mt-1 text-[10px] text-slate-500">{note}</p>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={COURSES.length + 2} className="px-5 py-12 text-center text-sm text-slate-500">
                    {query ? "No accounts match that search." : "No accounts yet. Create one above."}
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

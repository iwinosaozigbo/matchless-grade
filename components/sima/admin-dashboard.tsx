"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Gift,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MathBundleTab } from "@/components/sima/admin-math-bundle"
import type { MathLevel } from "@/lib/math-curriculum"
import { PaymentsTab } from "@/components/sima/admin-payments"
import { AccountsTab } from "@/components/sima/admin-accounts"
import { ReferralsTab } from "@/components/sima/admin-referrals"
import type { AdminAccount } from "@/lib/course-access"
import type { AdminReferralCode } from "@/lib/referral-types"
import type {
  SimaAdminActionResponse,
  SimaAdminDashboardData,
  SimaAdminLesson,
  SimaAdminLiveClassLink,
  SimaAdminTab,
} from "@/lib/sima/admin-types"

type TabGroup = "sima" | "math" | "workspace"

const tabs: { id: SimaAdminTab; label: string; icon: typeof LayoutDashboard; group: TabGroup }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "sima" },
  { id: "learners", label: "Learners & access", icon: Users, group: "sima" },
  { id: "timetable", label: "Content timetable", icon: CalendarDays, group: "sima" },
  { id: "mathematics", label: "Lessons", icon: BookOpen, group: "math" },
  { id: "liveClasses", label: "Weekly live classes", icon: Video, group: "math" },
  { id: "accounts", label: "Accounts & courses", icon: UserPlus, group: "workspace" },
  { id: "payments", label: "Payments", icon: CreditCard, group: "workspace" },
  { id: "referrals", label: "Referral codes", icon: Gift, group: "workspace" },
  { id: "activity", label: "Admin activity", icon: Activity, group: "workspace" },
]

const groups: Record<TabGroup, { label: string; eyebrow: string; courseHref?: string }> = {
  sima: { label: "SIMA Abacus", eyebrow: "SIMA ABACUS · BASIC 1", courseHref: "/learn" },
  math: { label: "Mathematics", eyebrow: "MATHEMATICS · UPPER BASIC, JUNIOR & SENIOR SECONDARY", courseHref: "/learn" },
  workspace: { label: "Workspace", eyebrow: "ALL COURSES" },
}

function formatNgn(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function toLocalDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function lessonStatus(lesson: SimaAdminLesson) {
  if (!lesson.is_published) return { label: "Draft", color: "text-slate-400 bg-slate-400/10" }
  if (Date.parse(lesson.release_at) > Date.now()) return { label: "Scheduled", color: "text-amber-300 bg-amber-300/10" }
  return { label: "Published", color: "text-emerald-300 bg-emerald-300/10" }
}

async function requestAdminUpdate(method: "POST" | "PATCH", payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/sima-abacus", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const result = (await response.json().catch(() => ({}))) as SimaAdminActionResponse
  if (!response.ok) throw new Error(result.error ?? "The request could not be completed.")
}

export function SimaAdminDashboard({
  initialData,
  adminEmail,
  mathLevels,
  accounts,
  referralCodes,
}: {
  initialData: SimaAdminDashboardData
  adminEmail: string
  mathLevels: MathLevel[]
  accounts: AdminAccount[]
  referralCodes: AdminReferralCode[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SimaAdminTab>("overview")
  const [query, setQuery] = useState("")
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const data = initialData

  async function runAction(key: string, method: "POST" | "PATCH", payload: Record<string, unknown>) {
    setBusyAction(key)
    setError(null)
    try {
      await requestAdminUpdate(method, payload)
      router.refresh()
      return true
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The request could not be completed.")
      return false
    } finally {
      setBusyAction(null)
    }
  }

  async function updateAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanedEmail = email.trim().toLowerCase()
    if (!cleanedEmail) return
    const succeeded = await runAction(`grant:${cleanedEmail}`, "POST", {
      action: "grant",
      email: cleanedEmail,
      reason,
    })
    if (succeeded) {
      setEmail("")
      setReason("")
    }
  }

  async function changeAccess(learnerEmail: string, grant: boolean) {
    if (!grant && !window.confirm(`Revoke SIMA course access for ${learnerEmail}?`)) return
    await runAction(`access:${learnerEmail}`, "POST", {
      action: grant ? "grant" : "revoke",
      email: learnerEmail,
      reason: grant ? "Access restored from the admin workspace." : "Access revoked from the admin workspace.",
    })
  }

  async function saveSchedule(event: FormEvent<HTMLFormElement>, lesson: SimaAdminLesson) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get("releaseAt")
    if (typeof value !== "string" || !value) return
    const releaseAt = new Date(value)
    if (Number.isNaN(releaseAt.getTime())) {
      setError("Choose a valid release date and time.")
      return
    }
    await runAction(`schedule:${lesson.id}`, "PATCH", {
      lessonId: lesson.id,
      releaseAt: releaseAt.toISOString(),
    })
  }

  async function togglePublished(lesson: SimaAdminLesson) {
    await runAction(`publish:${lesson.id}`, "PATCH", {
      lessonId: lesson.id,
      isPublished: !lesson.is_published,
    })
  }

  async function saveLiveClassLink(cohortKey: string, joinUrl: string, scheduleInfo: string) {
    return runAction(`live-class:${cohortKey}`, "PATCH", {
      action: "saveLiveClassLink",
      cohortKey,
      joinUrl,
      scheduleInfo,
    })
  }

  const filteredLearners = data.learners.filter((learner) => {
    const value = query.trim().toLowerCase()
    return !value || learner.email.includes(value) || learner.name?.toLowerCase().includes(value)
  })
  const upcomingLessons = data.lessons
    .filter((lesson) => lesson.is_published && Date.parse(lesson.release_at) > Date.now())
    .slice(0, 5)
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab)
  const activeGroup = groups[activeTabInfo?.group ?? "sima"]

  return (
    <main className="min-h-screen bg-[#0c1017] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.07] bg-[#10151e] px-5 py-5 lg:border-r lg:border-b-0 lg:px-4 lg:py-7">
          <a href="/admin" className="flex items-center gap-3 px-2" aria-label="Matchless Grade admin home">
            <span className="grid size-10 place-items-center rounded-2xl bg-violet-400/15 text-violet-200">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-wide">MATCHLESS GRADE</span>
              <span className="mt-0.5 block text-[11px] text-slate-500">ADMIN WORKSPACE</span>
            </span>
          </a>

          <nav aria-label="Admin sections" className="mt-8 flex gap-4 overflow-x-auto pb-1 lg:flex-col lg:gap-6 lg:overflow-visible">
            {(Object.keys(groups) as TabGroup[]).map((group) => (
              <div key={group} className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch lg:gap-1">
                <p className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 lg:block">
                  {groups[group].label}
                </p>
                {tabs
                  .filter((tab) => tab.group === group)
                  .map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      aria-pressed={activeTab === id}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        activeTab === id
                          ? "bg-violet-400/15 text-violet-100"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="lg:hidden">{group === "math" && id !== "liveClasses" ? "Mathematics" : label}</span>
                      <span className="hidden lg:inline">{label}</span>
                    </button>
                  ))}
              </div>
            ))}
          </nav>

          <div className="mt-9 hidden space-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 lg:block">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              3 COURSES LIVE
            </span>
            <p className="text-xs leading-5 text-slate-400">SIMA Abacus · {data.summary.lessonCount} lessons</p>
            <p className="text-xs leading-5 text-slate-400">
              Mathematics · {mathLevels.reduce((sum, level) => sum + (level.playlist?.videos.length ?? level.videos?.length ?? 0), 0)} lessons
            </p>
          </div>

          <div className="mt-8 hidden border-t border-white/[0.07] pt-5 lg:block">
            <p className="truncate text-xs font-medium text-slate-300">{adminEmail}</p>
            <p className="mt-1 text-[11px] text-slate-500">Administrator</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">{activeGroup.eyebrow}</p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                {activeTab === "liveClasses" ? "Weekly live-class links" : activeTabInfo?.group === "math" ? "Mathematics lessons" : activeTabInfo?.label}
              </h1>
            </div>
            {activeGroup.courseHref && (
              <a
                href={activeGroup.courseHref}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <Eye className="size-3.5" aria-hidden="true" />
                View course
              </a>
            )}
          </header>

          <div className="space-y-7 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            {error && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200">
                <X className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            {activeTab === "overview" && (
              <OverviewTab data={data} upcomingLessons={upcomingLessons} setActiveTab={setActiveTab} />
            )}
            {activeTab === "learners" && (
              <LearnersTab
                learners={filteredLearners}
                totalLearners={data.learners.length}
                query={query}
                setQuery={setQuery}
                email={email}
                setEmail={setEmail}
                reason={reason}
                setReason={setReason}
                busyAction={busyAction}
                onGrant={updateAccess}
                onChangeAccess={changeAccess}
              />
            )}
            {activeTab === "timetable" && (
              <TimetableTab lessons={data.lessons} busyAction={busyAction} onSchedule={saveSchedule} onPublish={togglePublished} />
            )}
            {activeTab === "accounts" && <AccountsTab accounts={accounts} />}
            {activeTab === "payments" && <PaymentsTab payments={data.payments} loadError={data.paymentsError} />}
            {activeTab === "referrals" && <ReferralsTab codes={referralCodes} />}
            {activeTab === "mathematics" && <MathBundleTab levels={mathLevels} />}
            {activeTab === "liveClasses" && <LiveClassesTab liveClassLinks={data.liveClassLinks} busyAction={busyAction} onSave={saveLiveClassLink} />}
            {activeTab === "activity" && <ActivityTab activity={data.activity} />}
          </div>
        </div>
      </div>
    </main>
  )
}

const LIVE_CLASS_COHORTS = ["Nursery 2 & Basic 1", "Basic 2-3", "Upper Basic", "Junior Secondary", "Senior Secondary"] as const
type LiveClassCohort = typeof LIVE_CLASS_COHORTS[number]
type LiveClassEntry = { joinUrl: string; scheduleInfo: string }

function LiveClassesTab({
  liveClassLinks,
  busyAction,
  onSave,
}: {
  liveClassLinks: SimaAdminLiveClassLink[]
  busyAction: string | null
  onSave: (cohortKey: string, joinUrl: string, scheduleInfo: string) => Promise<boolean>
}) {
  const configuredCohorts = new Set(liveClassLinks.map((link) => link.cohort_key))
  const [entries, setEntries] = useState<Record<LiveClassCohort, LiveClassEntry>>(() =>
    Object.fromEntries(LIVE_CLASS_COHORTS.map((cohort) => {
      const link = liveClassLinks.find((item) => item.cohort_key === cohort)
      return [cohort, { joinUrl: link?.join_url ?? "", scheduleInfo: link?.schedule_info ?? "" }]
    })) as Record<LiveClassCohort, LiveClassEntry>,
  )

  function updateEntry(cohort: LiveClassCohort, field: keyof LiveClassEntry, value: string) {
    setEntries((current) => ({ ...current, [cohort]: { ...current[cohort], [field]: value } }))
  }

  async function save(event: FormEvent<HTMLFormElement>, cohort: LiveClassCohort) {
    event.preventDefault()
    const entry = entries[cohort]
    await onSave(cohort, entry.joinUrl, entry.scheduleInfo)
  }

  return (
    <section aria-labelledby="live-class-settings-title" className="space-y-5">
      <div>
        <h2 id="live-class-settings-title" className="text-lg font-semibold text-white">Weekly live-class access</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
          Add each cohort&apos;s recurring meeting link and optional day/time. Only learners with access to that Mathematics cohort will see its join card.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {LIVE_CLASS_COHORTS.map((cohort) => {
          const entry = entries[cohort]
          const isBusy = busyAction === `live-class:${cohort}`
          const configured = configuredCohorts.has(cohort)
          return (
            <article key={cohort} className="rounded-2xl border border-white/[0.08] bg-[#121822] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Mathematics</p>
                  <h3 className="mt-1 text-base font-semibold text-white">{cohort}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${entry.joinUrl.trim() ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[0.05] text-slate-400"}`}>
                  {entry.joinUrl.trim() ? "Link entered" : configured ? "Removing on save" : "Not configured"}
                </span>
              </div>
              <form onSubmit={(event) => void save(event, cohort)} className="mt-5 space-y-4">
                <div>
                  <label htmlFor={`live-class-url-${LIVE_CLASS_COHORTS.indexOf(cohort)}`} className="mb-1.5 block text-xs font-medium text-slate-300">Meeting join URL</label>
                  <input
                    id={`live-class-url-${LIVE_CLASS_COHORTS.indexOf(cohort)}`}
                    type="url"
                    inputMode="url"
                    maxLength={2048}
                    autoComplete="url"
                    placeholder="https://meet.google.com/..."
                    value={entry.joinUrl}
                    onChange={(event) => updateEntry(cohort, "joinUrl", event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0c1017] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-300/20"
                  />
                </div>
                <div>
                  <label htmlFor={`live-class-schedule-${LIVE_CLASS_COHORTS.indexOf(cohort)}`} className="mb-1.5 block text-xs font-medium text-slate-300">Day and time (optional)</label>
                  <input
                    id={`live-class-schedule-${LIVE_CLASS_COHORTS.indexOf(cohort)}`}
                    type="text"
                    maxLength={160}
                    placeholder="e.g. Saturdays, 4:00 PM WAT"
                    value={entry.scheduleInfo}
                    onChange={(event) => updateEntry(cohort, "scheduleInfo", event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0c1017] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-300/20"
                  />
                </div>
                <Button type="submit" disabled={Boolean(busyAction) || (!entry.joinUrl.trim() && !configured)} className="w-full rounded-xl bg-violet-400 font-semibold text-[#11131a] hover:bg-violet-300 disabled:opacity-50">
                  {isBusy ? "Saving..." : entry.joinUrl.trim() ? "Save class link" : configured ? "Remove class link" : "No link to save"}
                </Button>
              </form>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function OverviewTab({
  data,
  upcomingLessons,
  setActiveTab,
}: {
  data: SimaAdminDashboardData
  upcomingLessons: SimaAdminLesson[]
  setActiveTab: (tab: SimaAdminTab) => void
}) {
  const stats = [
    { label: "Course learners", value: data.summary.learnerCount.toLocaleString(), detail: "Accounts with course activity", icon: Users, accent: "text-violet-300 bg-violet-400/10" },
    { label: "Verified payments", value: data.summary.paymentCount.toLocaleString(), detail: formatNgn(data.summary.revenueNgn), icon: ArrowDownRight, accent: "text-emerald-300 bg-emerald-400/10" },
    { label: "Manual access", value: data.summary.accessGrantedCount.toLocaleString(), detail: `${data.summary.accessRevokedCount} revoked`, icon: LockKeyhole, accent: "text-sky-300 bg-sky-400/10" },
    { label: "Published lessons", value: `${data.summary.publishedLessonCount}/${data.summary.lessonCount}`, detail: `${data.summary.upcomingLessonCount} scheduled next`, icon: FileText, accent: "text-amber-200 bg-amber-300/10" },
  ]

  return (
    <>
      <section aria-label="Course summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, accent }) => (
          <article key={label} className="rounded-2xl border border-white/[0.07] bg-[#121822] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">{value}</p>
                <p className="mt-1.5 text-xs text-slate-500">{detail}</p>
              </div>
              <span className={`grid size-9 place-items-center rounded-xl ${accent}`}><Icon className="size-4" aria-hidden="true" /></span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121822]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Next on the timetable</h2>
              <p className="mt-1 text-xs text-slate-500">Upcoming published lessons</p>
            </div>
            <button type="button" onClick={() => setActiveTab("timetable")} className="text-xs font-semibold text-violet-300 hover:text-violet-200">Full timetable</button>
          </div>
          {upcomingLessons.length ? (
            <div className="divide-y divide-white/[0.06]">
              {upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{lesson.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Week {lesson.week_number} · Lesson {lesson.lesson_number}</p>
                  </div>
                  <span className="shrink-0 text-right text-xs text-slate-400">{formatDate(lesson.release_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <CalendarDays className="mx-auto size-5 text-slate-500" aria-hidden="true" />
              <p className="mt-3 text-sm text-slate-300">Nothing scheduled next</p>
              <p className="mt-1 text-xs text-slate-500">Published lessons appear here when their release date is in the future.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-[#121822] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Quick actions</h2>
              <p className="mt-1 text-xs text-slate-500">Common course operations</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-white/[0.04] text-slate-300"><ShieldCheck className="size-4" aria-hidden="true" /></span>
          </div>
          <div className="mt-5 grid gap-2.5">
            <button type="button" onClick={() => setActiveTab("learners")} className="flex items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-left transition-colors hover:bg-white/[0.035]">
              <span className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-violet-400/10 text-violet-200"><Users className="size-4" aria-hidden="true" /></span><span><span className="block text-sm font-medium text-slate-200">Manage learner access</span><span className="mt-0.5 block text-xs text-slate-500">Grant or revoke full course access</span></span></span><ArrowUpRight className="size-4 text-slate-500" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setActiveTab("timetable")} className="flex items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-left transition-colors hover:bg-white/[0.035]">
              <span className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-amber-300/10 text-amber-200"><CalendarDays className="size-4" aria-hidden="true" /></span><span><span className="block text-sm font-medium text-slate-200">Update release plan</span><span className="mt-0.5 block text-xs text-slate-500">Reschedule and publish lessons</span></span></span><ArrowUpRight className="size-4 text-slate-500" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/[0.07] bg-[#121822]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
          <div><h2 className="text-sm font-semibold text-white">Recent learners</h2><p className="mt-1 text-xs text-slate-500">Access and engagement at a glance</p></div>
          <button type="button" onClick={() => setActiveTab("learners")} className="text-xs font-semibold text-violet-300 hover:text-violet-200">Manage all learners</button>
        </div>
        {data.learners.length ? (
          <div className="divide-y divide-white/[0.06]">
            {data.learners.slice(0, 5).map((learner) => (
              <div key={learner.email} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div><p className="text-sm font-medium text-slate-200">{learner.name ?? learner.email}</p><p className="mt-0.5 text-xs text-slate-500">{learner.email}</p></div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${learner.hasAccess ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-400/10 text-slate-400"}`}>{learner.hasAccess ? "Access active" : "Access revoked"}</span>
              </div>
            ))}
          </div>
        ) : <p className="px-5 py-8 text-sm text-slate-500">No learner accounts have purchased, received access, or started a lesson yet.</p>}
      </section>
    </>
  )
}

function LearnersTab({
  learners,
  totalLearners,
  query,
  setQuery,
  email,
  setEmail,
  reason,
  setReason,
  busyAction,
  onGrant,
  onChangeAccess,
}: {
  learners: SimaAdminDashboardData["learners"]
  totalLearners: number
  query: string
  setQuery: (value: string) => void
  email: string
  setEmail: (value: string) => void
  reason: string
  setReason: (value: string) => void
  busyAction: string | null
  onGrant: (event: FormEvent<HTMLFormElement>) => void
  onChangeAccess: (email: string, grant: boolean) => void
}) {
  return (
    <>
      <section className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.045] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><LockKeyhole className="size-4" aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold text-white">Grant full course access</h2><p className="mt-1 text-xs leading-5 text-slate-400">Access applies to every published SIMA Abacus lesson for this email, including future releases. Revoking access does not delete payment records.</p></div>
        </div>
        <form onSubmit={onGrant} className="mt-5 grid gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto]">
          <label className="sr-only" htmlFor="grant-email">Learner email</label>
          <input id="grant-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="learner@example.com" className="h-10 min-w-0 rounded-xl border border-white/10 bg-[#0d1119] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />
          <label className="sr-only" htmlFor="grant-reason">Reason for access</label>
          <input id="grant-reason" type="text" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason (optional)" className="h-10 min-w-0 rounded-xl border border-white/10 bg-[#0d1119] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />
          <Button type="submit" disabled={Boolean(busyAction)} className="h-10 rounded-xl bg-violet-300 px-4 text-sm font-semibold text-[#1c1630] hover:bg-violet-200">{busyAction?.startsWith("grant:") ? "Granting…" : "Grant access"}</Button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121822]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
          <div><h2 className="text-sm font-semibold text-white">Learner access</h2><p className="mt-1 text-xs text-slate-500">{totalLearners} course account{totalLearners === 1 ? "" : "s"} · payments remain unchanged</p></div>
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search learners</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="h-9 w-full rounded-xl border border-white/10 bg-[#0d1119] pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-violet-300/50" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Learner</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Progress</th><th className="px-4 py-3 font-semibold">Access</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead>
            <tbody className="divide-y divide-white/[0.06]">
              {learners.map((learner) => (
                <tr key={learner.email} className="align-middle">
                  <td className="px-5 py-4"><p className="font-medium text-slate-200">{learner.name ?? learner.email}</p><p className="mt-1 text-xs text-slate-500">{learner.email}</p></td>
                  <td className="px-4 py-4"><p className="text-xs text-slate-300">{learner.paidAt ? formatNgn(learner.paidAmountNgn) : "No payment"}</p><p className="mt-1 text-[11px] text-slate-500">{formatDate(learner.paidAt)}</p></td>
                  <td className="px-4 py-4"><p className="text-xs text-slate-300">{learner.completedLessons} completed</p><p className="mt-1 text-[11px] text-slate-500">{learner.totalLessonsStarted} lessons started</p></td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${learner.hasAccess ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}><span className={`size-1.5 rounded-full ${learner.hasAccess ? "bg-emerald-300" : "bg-rose-300"}`} />{learner.hasAccess ? "Active" : "Revoked"}</span>{learner.override !== null && <p className="mt-1 text-[10px] text-slate-500">Admin override</p>}</td>
                  <td className="px-5 py-4 text-right"><Button type="button" variant={learner.hasAccess ? "outline" : "secondary"} size="sm" disabled={Boolean(busyAction)} onClick={() => onChangeAccess(learner.email, !learner.hasAccess)} className="rounded-lg border-white/10 text-xs">{busyAction === `access:${learner.email}` ? "Saving…" : learner.hasAccess ? "Revoke" : "Restore"}</Button></td>
                </tr>
              ))}
              {!learners.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">{query ? "No learners match that search." : "No course learners to display yet. Grant access above to get started."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function TimetableTab({
  lessons,
  busyAction,
  onSchedule,
  onPublish,
}: {
  lessons: SimaAdminLesson[]
  busyAction: string | null
  onSchedule: (event: FormEvent<HTMLFormElement>, lesson: SimaAdminLesson) => void
  onPublish: (lesson: SimaAdminLesson) => void
}) {
  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#121822] p-5">
        <div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-xl bg-amber-300/10 text-amber-200"><CalendarDays className="size-4" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-white">Release timetable</h2><p className="mt-1 text-xs leading-5 text-slate-400">View every lesson, change its release time, and publish or unpublish it. Learner access checks both publication status and schedule.</p></div></div>
        <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">{lessons.length} lessons</span>
      </section>
      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121822]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Content</th><th className="px-4 py-3 font-semibold">Release schedule</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Publishing</th></tr></thead>
            <tbody className="divide-y divide-white/[0.06]">
              {lessons.map((lesson) => {
                const status = lessonStatus(lesson)
                const actionKey = `schedule:${lesson.id}`
                const publishingKey = `publish:${lesson.id}`
                return (
                  <tr key={lesson.id} className="align-top">
                    <td className="px-5 py-4"><p className="font-medium text-slate-200">{lesson.title}</p><p className="mt-1 text-xs text-slate-500">Week {lesson.week_number} · Lesson {lesson.lesson_number}</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{lesson.summary || "No lesson summary added."}</p></td>
                    <td className="px-4 py-4"><form onSubmit={(event) => onSchedule(event, lesson)} className="flex items-center gap-2"><label className="sr-only" htmlFor={`release-${lesson.id}`}>Release date and time for {lesson.title}</label><input id={`release-${lesson.id}`} name="releaseAt" type="datetime-local" required defaultValue={toLocalDateTime(lesson.release_at)} className="h-9 min-w-[205px] rounded-lg border border-white/10 bg-[#0d1119] px-2 text-xs text-slate-200 outline-none focus:border-violet-300/50 [color-scheme:dark]" /><Button type="submit" variant="outline" size="sm" disabled={Boolean(busyAction)} className="rounded-lg border-white/10 text-xs">{busyAction === actionKey ? "Saving…" : "Save"}</Button></form><p className="mt-2 text-[11px] text-slate-500">Current: {formatDate(lesson.release_at)}</p></td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.color}`}>{status.label}</span></td>
                    <td className="px-5 py-4 text-right"><Button type="button" variant={lesson.is_published ? "outline" : "secondary"} size="sm" disabled={Boolean(busyAction)} onClick={() => onPublish(lesson)} className="rounded-lg border-white/10 text-xs">{busyAction === publishingKey ? "Saving…" : lesson.is_published ? "Unpublish" : "Publish"}</Button></td>
                  </tr>
                )
              })}
              {!lessons.length && <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-500">No scheduled content is available.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function ActivityTab({ activity }: { activity: SimaAdminDashboardData["activity"] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121822]">
      <div className="border-b border-white/[0.07] px-5 py-4"><h2 className="text-sm font-semibold text-white">Administrator audit trail</h2><p className="mt-1 text-xs text-slate-500">Access and publication changes are recorded with the acting admin and timestamp.</p></div>
      <div className="divide-y divide-white/[0.06]">
        {activity.map((entry) => {
          const isGrant = entry.action === "access_granted"
          const isAccess = entry.action.startsWith("access_")
          const label = entry.action === "access_granted" ? "Granted course access" : entry.action === "access_revoked" ? "Revoked course access" : entry.action === "lesson_published" ? "Published lesson" : entry.action === "lesson_unpublished" ? "Unpublished lesson" : "Updated release schedule"
          return (
            <article key={entry.id} className="flex gap-3 px-5 py-4">
              <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${isAccess ? isGrant ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300" : "bg-violet-300/10 text-violet-200"}`}>
                {isAccess ? isGrant ? <Check className="size-4" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" /> : <CalendarDays className="size-4" aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-slate-200">{label}</p><time className="text-[11px] text-slate-500" dateTime={entry.created_at}>{formatDate(entry.created_at)}</time></div><p className="mt-1 break-all text-xs text-slate-400">{entry.target_email}</p>{entry.reason && <p className="mt-1 text-xs text-slate-500">{entry.reason}</p>}</div>
            </article>
          )
        })}
        {!activity.length && <div className="px-5 py-12 text-center"><Clock3 className="mx-auto size-5 text-slate-500" aria-hidden="true" /><p className="mt-3 text-sm text-slate-300">No admin activity yet</p><p className="mt-1 text-xs text-slate-500">Changes to access or the timetable will appear here.</p></div>}
      </div>
    </section>
  )
}

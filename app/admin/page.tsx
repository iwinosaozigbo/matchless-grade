import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { SimaAdminDashboard } from "@/components/sima/admin-dashboard"
import { getSimaAdminAccess, getSimaAdminDashboard } from "@/lib/sima/admin"
import { getAllCourseLevels } from "@/lib/math-playlists"
import { getAdminAccounts } from "@/lib/course-access"
import { getAdminReferralCodes } from "@/lib/referrals"

export const metadata: Metadata = {
  title: "Admin workspace | Matchless Grade",
  description: "Manage SIMA Abacus access, lesson releases, and Mathematics weekly live-class links.",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const access = await getSimaAdminAccess()
  if (access.status === "sign-in") redirect("/login?next=%2Fadmin")
  if (access.status === "forbidden") notFound()

  if (access.status === "unconfigured") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d1017] px-6 text-white">
        <section className="max-w-lg rounded-3xl border border-white/10 bg-[#151a24] p-8 text-center shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">Admin setup</p>
          <h1 className="mt-4 font-display text-3xl font-semibold">Almost ready</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Add the <code className="rounded bg-white/10 px-1.5 py-0.5 text-violet-200">SIMA_ADMIN_EMAILS</code> server variable with the email address of your existing admin account. You can include multiple addresses separated by commas.
          </p>
        </section>
      </main>
    )
  }

  const [data, mathLevels, accounts, referralCodes] = await Promise.all([
    getSimaAdminDashboard(),
    getAllCourseLevels(),
    getAdminAccounts(),
    getAdminReferralCodes(),
  ])
  return (
    <SimaAdminDashboard
      initialData={data}
      adminEmail={access.user.email}
      mathLevels={mathLevels}
      accounts={accounts}
      referralCodes={referralCodes}
    />
  )
}

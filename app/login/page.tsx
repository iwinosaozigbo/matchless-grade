import { redirect } from "next/navigation"
import { SimaSignInForm } from "@/components/sima/sign-in-form"
import { createClient } from "@/lib/supabase/server"

function safeNextPath(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return "/learn"
  }
  if (candidate === "/admin" || candidate.startsWith("/admin?")) return candidate
  if (candidate === "/learn" || candidate.startsWith("/learn/") || candidate.startsWith("/learn?")) {
    return candidate
  }
  return "/learn"
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string | string[]; next?: string | string[] }>
}) {
  const params = await searchParams
  const nextPath = safeNextPath(params.next)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(nextPath)

  return <SimaSignInForm paymentConfirmed={params.payment === "confirmed"} nextPath={nextPath} />
}

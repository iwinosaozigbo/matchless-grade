import { redirect } from "next/navigation"
import { SimaResetPasswordForm } from "@/components/sima/reset-password-form"
import { createClient } from "@/lib/supabase/server"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return <SimaResetPasswordForm nextPath={params.next === "/admin" ? "/admin" : "/learn"} />
}

import { redirect } from "next/navigation"
import { SimaSignInForm } from "@/components/sima/sign-in-form"
import { createClient } from "@/lib/supabase/server"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string | string[]; next?: string | string[] }>
}) {
  const params = await searchParams
  const nextPath = params.next === "/admin"
    ? "/admin"
    : params.next === "/learn?purchase=sima-abacus"
      ? "/learn?purchase=sima-abacus"
      : "/learn"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(nextPath)

  return <SimaSignInForm paymentConfirmed={params.payment === "confirmed"} nextPath={nextPath} />
}

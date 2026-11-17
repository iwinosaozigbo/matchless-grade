import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/sima/forgot-password-form"

export const metadata: Metadata = {
  title: "Reset your password | Matchless Grade",
  robots: { index: false, follow: false },
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const params = await searchParams
  return <ForgotPasswordForm nextPath={params.next === "/admin" ? "/admin" : "/learn"} />
}

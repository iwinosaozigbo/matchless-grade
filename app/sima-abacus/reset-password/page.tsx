import { redirect } from "next/navigation"

export default async function RetiredSimaResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const params = await searchParams
  redirect(params.next === "/admin" ? "/reset-password?next=%2Fadmin" : "/reset-password?next=%2Flearn")
}

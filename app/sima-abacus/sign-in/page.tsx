import { redirect } from "next/navigation"

export default async function RetiredSimaSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string | string[]; next?: string | string[] }>
}) {
  const params = await searchParams
  if (params.next === "/admin") redirect("/login?next=%2Fadmin")
  if (params.payment === "confirmed") redirect("/login?payment=confirmed")
  redirect("/login")
}

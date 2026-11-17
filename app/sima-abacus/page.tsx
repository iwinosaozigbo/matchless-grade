import { redirect } from "next/navigation"
import { getSimaMember } from "@/lib/sima/server"

export default async function SimaAbacusEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string | string[]; access?: string | string[] }>
}) {
  const params = await searchParams
  if (params.payment === "confirmed") redirect("/learn?payment=confirmed")
  if (params.access === "required") redirect("/learn?access=required")

  const member = await getSimaMember()
  if (!member) redirect("/signup?product=sima-abacus")
  redirect("/learn?purchase=sima-abacus")
}

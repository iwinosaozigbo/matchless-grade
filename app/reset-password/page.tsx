import Link from "next/link"
import { redirect } from "next/navigation"
import { LockKeyhole } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimaResetPasswordForm } from "@/components/sima/reset-password-form"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && params.error === "expired") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background bg-dots px-5 py-10 text-foreground">
        <Card className="w-full max-w-md rounded-[2rem] border-2 border-brand/15 shadow-soft">
          <CardHeader className="gap-2 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="font-display text-3xl">This reset link has expired</CardTitle>
            <CardDescription>Request a fresh link, then follow it to choose a new password. For your security, reset links can only be used once.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/forgot-password" className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full")}>Request a new link</Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "w-full rounded-full")}>Back to sign in</Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!user) redirect("/login")

  return <SimaResetPasswordForm nextPath={params.next === "/admin" ? "/admin" : "/learn"} />
}

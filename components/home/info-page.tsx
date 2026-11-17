import { SiteNav } from "@/components/landing/site-nav"
import { SiteFooter } from "@/components/home/home-faq-cta"

export function InfoPage({
  title,
  intro,
  bullets,
  children,
}: {
  title: string
  intro: string
  bullets: string[]
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2">
        <div>
          <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-4 text-pretty text-lg leading-8 text-muted-foreground">{intro}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 font-semibold leading-6">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

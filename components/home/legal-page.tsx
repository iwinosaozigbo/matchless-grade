import { SiteNav } from "@/components/landing/site-nav"
import { SiteFooter } from "@/components/home/home-faq-cta"

export type LegalSection = { heading: string; body: string[] }

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground">{intro}</p>
        <div className="mt-10 flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-7 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteNav } from "@/components/landing/site-nav"
import { PillLink } from "@/components/pill-button"
import { FinalCta, SiteFooter } from "@/components/home/home-faq-cta"

export const metadata: Metadata = {
  title: "About | MatchlessGrade",
  description:
    "MatchlessGrade makes maths something children want to practise, with game-based lessons from Nursery 2 to Senior Secondary.",
  alternates: { canonical: "/about" },
}

const PRINCIPLES = [
  {
    title: "Maths should feel like play",
    body: "Children practise more when it is fun. Our lessons use games, rewards and short challenges so practice becomes a habit rather than a fight.",
  },
  {
    title: "Start where the child really is",
    body: "A free diagnostic test shows exactly which topics need work, so time is spent on the gaps that matter.",
  },
  {
    title: "Parents stay in the loop",
    body: "Clear progress reports mean you always know how your child is doing and where to help.",
  },
  {
    title: "Fair, simple pricing",
    body: "Plans are monthly and billed by card. You can cancel any time with no long-term commitment.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <h1 className="text-balance font-display text-4xl font-bold sm:text-5xl">
          Helping every child get a matchless grade in maths.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
          MatchlessGrade is a maths learning platform for children from Nursery 2 to Senior Secondary, built so that
          practising feels like playing. We also offer SIMA Abacus for mental arithmetic, and partner with schools and
          employers who want better maths outcomes for their pupils and staff.
        </p>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {PRINCIPLES.map((item) => (
            <li key={item.title} className="rounded-[2rem] border-2 border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold">{item.title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <PillLink href="/diagnostic" variant="sun" size="lg">
            Take the free maths test
            <ArrowRight className="h-5 w-5" />
          </PillLink>
          <Link href="/contact" className="font-semibold text-brand underline-offset-4 hover:underline">
            Get in touch
          </Link>
        </div>
      </main>
      <FinalCta />
      <SiteFooter />
    </div>
  )
}

import { ArrowUpRight, Check, Sigma } from "lucide-react"
import Link from "next/link"
import type { MathLevel } from "@/lib/math-curriculum"
import { Reveal } from "@/components/reveal"

const ACCENT: Record<string, { chip: string; ring: string; dot: string }> = {
  sun: { chip: "bg-sun text-sun-foreground", ring: "text-sun", dot: "text-sun" },
  mint: { chip: "bg-mint text-white", ring: "text-mint", dot: "text-mint" },
  brand: { chip: "bg-brand text-brand-foreground", ring: "text-brand", dot: "text-brand" },
}

export function MathCurriculum({ levels }: { levels: MathLevel[] }) {
  return (
    <section id="mathematics" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-brand">
          <Sigma className="h-4 w-4" />
          Mathematics
        </p>
        <h2 className="mt-2 text-balance font-display text-4xl font-bold sm:text-5xl">
          One subject, mapped to every stage
        </h2>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          From counting blocks to calculus. Choose the stage your child is in and see exactly what they&apos;ll learn.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {levels.map((level, i) => {
          const accent = ACCENT[level.color]
          return (
            <Reveal key={level.id} delay={i * 120}>
              <div className="flex h-full flex-col rounded-[1.8rem] border-2 border-border bg-card p-6 shadow-toy">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wide shadow-toy ${accent.chip}`}
                  >
                    {level.stage}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{level.grades}</span>
                </div>

                <p className="mt-4 text-pretty text-sm font-medium text-foreground/80">{level.tagline}</p>

                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {level.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5 text-sm font-medium text-foreground/90">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary ${accent.dot}`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      {topic}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup?product=mathematics"
                  className="group mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 font-display text-sm font-bold text-background transition-transform hover:-translate-y-0.5"
                >
                  Start this stage
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Code2, FlaskConical, Sigma } from "lucide-react"
import { SUBJECTS } from "@/lib/lessons-data"
import { Reveal } from "@/components/reveal"
import { AGE_COPY, type AgeKey } from "@/lib/age-variants"

const TEEN_SUBJECT: Record<string, { icon: typeof Sigma; glyphs: string[] }> = {
  math: { icon: Sigma, glyphs: ["∑", "π", "√", "∫", "θ", "≠"] },
  science: { icon: FlaskConical, glyphs: ["⚛", "Δ", "λ", "H₂O", "°", "µ"] },
  coding: { icon: Code2, glyphs: ["{ }", "</>", "( )", ";", "==", "[]"] },
  reading: { icon: BookOpen, glyphs: ["Aa", "¶", "“ ”", "&", "!", "?"] },
}

const GLYPH_POS = [
  "left-[8%] top-[16%]",
  "right-[10%] top-[22%]",
  "left-[16%] bottom-[18%]",
  "right-[18%] bottom-[14%]",
  "left-[44%] top-[10%]",
  "right-[40%] bottom-[24%]",
]

export function AgeDiscover({ age }: { age: Exclude<AgeKey, "all"> }) {
  const copy = AGE_COPY[age]

  if (age === "1-5") {
    return (
      <section className="bg-cream pb-20 pt-4 text-cream-foreground">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-brand">
              {copy.sectionEyebrow}
            </p>
            <h2 className="mt-2 text-balance font-display text-3xl font-bold sm:text-4xl">
              {copy.sectionHeading}
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-cream-foreground/75">
              {copy.sectionIntro}
            </p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-4">
            {SUBJECTS.slice(0, 3).map((s, i) => (
              <Reveal key={s.id} delay={i * 100}>
                <Link
                  href="/login"
                  className="flex items-center gap-4 rounded-[2rem] border-2 border-cream-foreground/10 bg-background p-4 shadow-toy transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    <Image
                      src={s.image || "/placeholder.svg"}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-bold">{s.title}</h3>
                    <p className="text-sm text-cream-foreground/65">{s.tagline}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-brand" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (age === "6-12") {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6">
        <Reveal className="max-w-xl">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-brand">{copy.sectionEyebrow}</p>
          <h2 className="mt-2 text-balance font-display text-4xl font-bold sm:text-5xl">{copy.sectionHeading}</h2>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">{copy.sectionIntro}</p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s, i) => (
            <Reveal
              key={s.id}
              delay={i * 90}
              className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : undefined}
            >
              <Link
                href="/login"
                className={`group relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border-2 border-border bg-card shadow-toy transition-all duration-300 hover:-translate-y-2 hover:shadow-soft ${
                  i === 0 ? "lg:h-full" : ""
                }`}
              >
                <div className={`relative overflow-hidden ${i === 0 ? "aspect-[4/5] lg:aspect-auto lg:h-2/3" : "aspect-[16/10]"}`}>
                  <Image
                    src={s.image || "/placeholder.svg"}
                    alt={`${s.title} pathway`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-brand-foreground shadow-toy">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-between gap-2 p-4">
                  <div>
                    <h3 className="font-display text-lg font-bold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.tagline}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-brand transition-transform duration-300 group-hover:rotate-45" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <Reveal className="max-w-xl">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-brand">{copy.sectionEyebrow}</p>
        <h2 className="mt-2 text-balance font-display text-4xl font-bold sm:text-5xl">{copy.sectionHeading}</h2>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">{copy.sectionIntro}</p>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {SUBJECTS.filter((s) => s.id !== "abacus").map((s, i) => {
          const config = TEEN_SUBJECT[s.id] ?? TEEN_SUBJECT.math
          const Icon = config.icon
          return (
            <Reveal key={s.id} delay={i * 80}>
              <Link
                href="/login"
                className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card transition-colors duration-300 hover:border-brand/40"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-ink text-ink-foreground">
                  <div aria-hidden className="absolute inset-0">
                    {config.glyphs.map((g, gi) => (
                      <span
                        key={gi}
                        className={`absolute font-display text-2xl font-bold text-ink-foreground/15 sm:text-3xl ${GLYPH_POS[gi]}`}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 backdrop-blur-sm">
                      <Icon className="h-8 w-8 text-sun" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <div>
                    <h3 className="font-display text-lg font-bold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.tagline}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

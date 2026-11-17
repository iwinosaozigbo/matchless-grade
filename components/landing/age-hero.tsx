import Image from "next/image"
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react"
import { PillLink } from "@/components/pill-button"
import { Reveal } from "@/components/reveal"
import { AGE_COPY, type AgeKey } from "@/lib/age-variants"

export function AgeHero({ age }: { age: Exclude<AgeKey, "all"> }) {
  const copy = AGE_COPY[age]

  if (age === "1-5") {
    return (
      <section className="relative overflow-hidden bg-cream pb-16 pt-14 text-cream-foreground sm:pb-20">
        <Star aria-hidden className="absolute left-[8%] top-[18%] h-6 w-6 text-sun/70" />
        <Sparkles aria-hidden className="absolute right-[12%] top-[10%] h-7 w-7 text-bubblegum/60" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-cream-foreground/15 bg-background px-4 py-1.5 text-sm font-semibold shadow-toy">
              <Heart className="h-4 w-4 text-bubblegum" />
              {copy.eyebrow}
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
              {copy.headline} <span className="text-brand">{copy.headlineAccent}</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-cream-foreground/80">
              {copy.body}
            </p>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-cream-foreground/60">
              {copy.note}
            </p>
            <div className="mt-8">
              <PillLink href="/login" variant="sun" size="lg">
                {copy.ctaLabel}
                <ArrowRight className="h-5 w-5" />
              </PillLink>
            </div>
          </Reveal>

          <Reveal delay={140} className="flex justify-center">
            <div className="relative w-full max-w-sm overflow-hidden rounded-[3rem] border-4 border-background bg-background shadow-soft">
              <Image
                src="/little-minds-big-maths.png"
                alt="Happy young children playing with colourful number blocks, an abacus and maths books in a bright classroom — Little Minds, Big Maths"
                width={560}
                height={560}
                priority
                className="w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (age === "6-12") {
    return (
      <section className="relative overflow-hidden bg-background bg-dots pb-14 pt-14 sm:pb-16">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-brand-foreground">
              {copy.eyebrow}
            </span>
            <h1 className="mt-5 text-balance font-display text-5xl font-bold leading-[0.95] sm:text-6xl">
              {copy.headline} <span className="text-brand">{copy.headlineAccent}</span>
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-lg text-muted-foreground">{copy.body}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <PillLink href="/login" variant="sun" size="lg">
                {copy.ctaLabel}
                <ArrowRight className="h-5 w-5" />
              </PillLink>
              <p className="text-sm font-semibold text-muted-foreground">{copy.note}</p>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-16 text-ink-foreground sm:pb-20">
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-foreground/70">
            {copy.eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl font-bold leading-[1.02] sm:text-6xl">
            {copy.headline} <span className="text-sun">{copy.headlineAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-foreground/75">{copy.body}</p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <PillLink href="/login" variant="sun" size="lg">
              {copy.ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </PillLink>
            <p className="max-w-xs text-sm text-ink-foreground/55">{copy.note}</p>
          </div>
        </Reveal>

        <Reveal delay={140} className="flex justify-center">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-ink-foreground/10 shadow-soft">
            <Image
              src="/teens-study-together.jpg"
              alt="Three senior secondary students studying their mathematics work together at a desk"
              width={560}
              height={696}
              className="w-full"
              priority
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

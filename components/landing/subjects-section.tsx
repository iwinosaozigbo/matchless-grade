import Image from "next/image"
import { ArrowUpRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { SUBJECTS } from "@/lib/lessons-data"
import { Reveal } from "@/components/reveal"

const RING: Record<string, string> = {
  brand: "text-brand",
  sun: "text-sun",
  grape: "text-grape",
  mint: "text-mint",
  bubblegum: "text-bubblegum",
  sky: "text-sky",
}

const CHIP: Record<string, string> = {
  brand: "bg-brand text-brand-foreground",
  sun: "bg-sun text-sun-foreground",
  grape: "bg-grape text-white",
  mint: "bg-mint text-white",
  bubblegum: "bg-bubblegum text-white",
  sky: "bg-sky text-white",
}

export function SubjectsSection() {
  return (
    <section id="subjects" className="mx-auto max-w-6xl px-4 pt-52 sm:px-6 sm:pt-56">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-brand">
          <Sparkles className="h-4 w-4 animate-wiggle" />
          Programs
        </p>
        <h2 className="mt-2 text-balance font-display text-4xl font-bold sm:text-5xl">
          Pick a world to explore
        </h2>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          Bite-sized lessons in the subjects kids love, each packed with videos, quizzes and rewards.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SUBJECTS.map((s, i) => (
          <Reveal key={s.id} delay={i * 110}>
            <Link
              href="/login"
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border-2 border-border bg-card shadow-toy transition-all duration-300 hover:-translate-y-2 hover:shadow-soft"
            >
              {/* full-bleed vibrant scene */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={s.image || "/placeholder.svg"}
                  alt={`${s.title} world`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {/* shine sweep on hover */}
                <span
                  aria-hidden
                  className="group-hover-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 font-display text-xs font-bold shadow-toy ${CHIP[s.color]}`}
                >
                  {s.lessons.length} lesson{s.lessons.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-1 items-start justify-between gap-2 p-5">
                <div>
                  <h3 className="font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.tagline}</p>
                </div>
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary transition-transform duration-300 group-hover:rotate-45 ${RING[s.color]}`}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

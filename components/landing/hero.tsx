import Image from "next/image"
import { ArrowRight, Sparkles, Tag } from "lucide-react"
import { PillLink } from "@/components/pill-button"
import { FloatingShapes } from "@/components/floating-shapes"

const HERO_CARDS = [
  { n: 1, title: "Mathematics", img: "/subject-math.png", color: "bg-sun/20" },
  { n: 2, title: "Sima Abacus", img: "/subject-abacus.png", color: "bg-mint/15" },
  { n: 3, title: "English", img: "/subject-reading.png", color: "bg-sky/15" },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background bg-dots pb-32 pt-14 text-foreground sm:pb-40 sm:pt-16">
      <FloatingShapes />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground shadow-toy">
            <Sparkles className="h-4 w-4 text-sun" />
            Playful, gamified learning
          </span>
          <h1 className="mt-5 text-balance font-display text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl">
            Boost Your <span className="text-brand">Child&apos;s</span> Future
          </h1>
          <p className="mt-5 max-w-md text-pretty text-lg text-muted-foreground">
            Unlocking potential with interactive lessons, quizzes and flashcards — where every
            correct answer earns XP, levels and shiny achievement badges.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground shadow-toy">
            <Tag className="h-4 w-4 text-brand" />
            Tutoring as low as{" "}
            <span className="font-display font-bold text-brand">
              <span className="font-sans">₦</span>25,000
            </span>{" "}
            / month
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PillLink href="/signup" variant="sun" size="lg">
              Register now
              <ArrowRight className="h-5 w-5" />
            </PillLink>
            <a
              href="#pricing"
              className="font-display text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              See pricing
            </a>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="animate-float relative w-full max-w-md overflow-hidden rounded-[2.5rem] border-4 border-card bg-card shadow-soft lg:max-w-lg">
            <Image
              src="/teens-hero.jpg"
              alt="Three secondary-school students in navy uniforms holding mathematics and science textbooks in a classroom"
              width={620}
              height={620}
              priority
              className="w-full"
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-brand px-3 py-1 font-display text-xs font-bold text-brand-foreground">
              Learn together, grow together
            </span>
          </div>
        </div>
      </div>

      {/* floating subject cards overlapping the fold */}
      <div className="relative z-10 mx-auto -mb-40 mt-10 grid max-w-5xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
        {HERO_CARDS.map((c) => (
          <div
            key={c.n}
            className="flex items-center gap-3 rounded-3xl border-2 border-border bg-card p-4 text-card-foreground shadow-soft"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-brand-foreground">
              {c.n}
            </span>
            <span className="font-display text-lg font-bold">{c.title}</span>
            <div className={`ml-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl ${c.color}`}>
              <Image src={c.img} alt="" width={56} height={56} className="h-full w-full object-cover" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

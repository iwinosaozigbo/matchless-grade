import { MonitorPlay, PencilLine, Trophy } from "lucide-react"
import { Reveal } from "@/components/reveal"

const STEPS = [
  {
    icon: MonitorPlay,
    title: "Watch a lesson",
    body: "Press play on a friendly video lesson that explains the topic step by step.",
    color: "bg-sky/15 text-sky",
  },
  {
    icon: PencilLine,
    title: "Practice & quiz",
    body: "Flip flashcards and answer quick quizzes to lock the knowledge in.",
    color: "bg-mint/20 text-mint",
  },
  {
    icon: Trophy,
    title: "Earn rewards",
    body: "Collect XP, level up and unlock badges the moment you finish.",
    color: "bg-sun/20 text-sun",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-brand">How it works</p>
        <h2 className="mt-2 text-balance font-display text-4xl font-bold sm:text-5xl">
          Three simple steps to mastery
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 140}>
            <div className="group relative h-full rounded-[1.8rem] border-2 border-border bg-card p-6 shadow-toy transition-transform duration-300 hover:-translate-y-2">
              <span className="absolute right-5 top-4 font-display text-5xl font-bold text-secondary transition-colors group-hover:text-brand/20">
                {i + 1}
              </span>
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:animate-wiggle ${s.color}`}
              >
                <s.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

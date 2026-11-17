import { Award, Crown, Flame, Trophy, Zap } from "lucide-react"
import { Reveal } from "@/components/reveal"

const FEATURES = [
  {
    icon: Zap,
    title: "Earn XP & level up",
    body: "Every lesson, quiz and flashcard earns experience points that push you to the next level.",
    color: "bg-brand text-brand-foreground",
  },
  {
    icon: Award,
    title: "Collect badges",
    body: "Unlock achievement badges for perfect scores, streaks and reaching new milestones.",
    color: "bg-grape text-white",
  },
  {
    icon: Flame,
    title: "Keep your streak",
    body: "Learn a little every day and watch your streak flame grow — consistency is the superpower.",
    color: "bg-sun text-sun-foreground",
  },
]

const MOCK_BOARD = [
  { name: "Alice Koller", pct: "73% completed", rank: 3, avatar: "🦊", bg: "bg-mint/20" },
  { name: "Michael Kopfler", pct: "75% completed", rank: 2, avatar: "🐨", bg: "bg-grape/15" },
]

export function GamifiedSection() {
  return (
    <section id="gamified" className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-brand">Rewards</p>
            <h2 className="mt-2 text-balance font-display text-4xl font-bold sm:text-5xl">
              Learning that feels like a game
            </h2>
            <p className="mt-3 text-pretty text-lg text-muted-foreground">
              We turn studying into an adventure. Kids stay motivated because progress is visible,
              celebrated and rewarded.
            </p>
          </Reveal>

          <div className="mt-8 flex flex-col gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 120}>
                <div className="group flex gap-4 rounded-3xl border-2 border-border bg-card p-4 shadow-toy transition-all duration-300 hover:-translate-y-1 hover:border-brand/40">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:animate-wiggle ${f.color}`}
                  >
                    <f.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* mock leaderboard card */}
        <Reveal delay={150} className="relative">
          <div className="animate-bob rounded-[2rem] border-2 border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-sun" />
              <h3 className="font-display text-2xl font-bold">Our leaderboard</h3>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {MOCK_BOARD.map((p) => (
                <div key={p.name} className={`flex items-center gap-3 rounded-2xl ${p.bg} p-3`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-lg">
                    {p.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.pct}</p>
                  </div>
                  <span className="font-display text-sm font-bold text-muted-foreground">#{p.rank}</span>
                </div>
              ))}

              {/* winner */}
              <div className="relative mt-2 rounded-3xl border-2 border-sun bg-sun/10 p-5 text-center">
                <Crown className="absolute left-1/2 top-3 h-6 w-6 -translate-x-1/2 animate-wiggle text-sun" />
                <div className="relative mx-auto mt-6 flex h-16 w-16 items-center justify-center">
                  <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-sun" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-card text-3xl shadow-toy">
                    🦁
                  </span>
                </div>
                <p className="mt-2 font-display text-lg font-bold">Kameron Porter</p>
                <span className="mt-1 inline-block rounded-full bg-mint/25 px-3 py-0.5 text-xs font-semibold text-foreground">
                  100% completed
                </span>
                <p className="mt-3 font-display text-4xl font-bold text-brand">1,809</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total XP</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

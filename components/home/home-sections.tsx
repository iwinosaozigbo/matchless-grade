import Link from "next/link"
import {
  Building2,
  CalendarCheck,
  ChartNoAxesColumn,
  MessageCircle,
  PlayCircle,
  School,
  Trophy,
  Users,
  PencilLine,
} from "lucide-react"
import { RESULTS, TESTIMONIALS } from "@/lib/home-content"

function SectionHeading({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="font-display text-sm font-bold uppercase tracking-wide text-brand">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-balance font-display text-3xl font-bold sm:text-5xl">{children}</h2>
    </div>
  )
}

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
      <SectionHeading>Most children don&apos;t hate maths. They&apos;re just stuck.</SectionHeading>
      <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
        One missed topic in JSS1 becomes a struggle in SSS2. By exam time, it feels too late. MatchlessGrade finds
        exactly where your child got stuck and closes that gap, one short lesson at a time.
      </p>
    </section>
  )
}

const STEPS = [
  {
    icon: PlayCircle,
    title: "Watch",
    body: "Short, clear video lessons for every topic from Nursery 2 to SSS3.",
    tone: "bg-sun/30 text-sun-foreground",
  },
  {
    icon: PencilLine,
    title: "Practise",
    body: "Quizzes and flashcards right after each lesson, with instant marking and explanations.",
    tone: "bg-brand/15 text-brand",
  },
  {
    icon: Users,
    title: "Live Classes",
    body: "Join other students across the globe for a live class where questions are asked and solved.",
    tone: "bg-mint/25 text-foreground",
  },
  {
    icon: Trophy,
    title: "Earn",
    body: "XP, badges, streaks and a leaderboard turn daily practice into a habit your child is proud of.",
    tone: "bg-bubblegum/30 text-foreground",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24">
      <SectionHeading eyebrow="How it works">Watch. Practise. Earn.</SectionHeading>
      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="flex flex-col rounded-[2rem] border-2 border-border bg-card p-6 shadow-soft"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.tone}`}>
              <step.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ProgrammesSection() {
  return (
    <section id="subjects" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24">
      <SectionHeading eyebrow="Programmes">
        Two programmes. One goal: confidence with numbers.
      </SectionHeading>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="rounded-[2rem] border-2 border-border bg-card p-7 shadow-soft">
          <h3 className="font-display text-2xl font-bold">Mathematics: Nursery 2 to SSS3</h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            The full maths curriculum from first counting to secondary school, covering fractions and algebra through
            trigonometry and statistics. Secondary lessons are built around BECE and WAEC questions.
          </p>
        </article>
        <article className="rounded-[2rem] border-2 border-border bg-card p-7 shadow-soft">
          <h3 className="font-display text-2xl font-bold">SIMA Abacus mental maths</h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            Our mental arithmetic programme trains children to calculate quickly and accurately in their heads. It
            builds speed, focus and memory that show up in every subject.
          </p>
          <Link
            href="/sima-abacus"
            className="mt-4 inline-block font-display text-sm font-bold text-brand underline-offset-4 hover:underline"
          >
            Learn about SIMA Abacus
          </Link>
        </article>
      </div>
    </section>
  )
}

const PARENT_POINTS = [
  { icon: ChartNoAxesColumn, text: "A free starting report showing their real level and weak topics" },
  { icon: MessageCircle, text: "Weekly progress updates on WhatsApp" },
  { icon: CalendarCheck, text: "See time spent, topics mastered and quiz scores at a glance" },
]

export function ParentsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
      <div className="rounded-[2.5rem] border-2 border-border bg-card bg-dots p-8 shadow-soft sm:p-12">
        <SectionHeading eyebrow="For parents">You&apos;ll always know how your child is doing.</SectionHeading>
        <ul className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {PARENT_POINTS.map((p) => (
            <li key={p.text} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <p.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-pretty font-semibold leading-6">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ProofSection() {
  if (TESTIMONIALS.length === 0 && !RESULTS) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
      <SectionHeading eyebrow="Proof">Parents are seeing the difference.</SectionHeading>
      {TESTIMONIALS.length > 0 && (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.parent} className="rounded-[2rem] border-2 border-border bg-card p-6 shadow-soft">
              <blockquote className="leading-7">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-muted-foreground">
                {t.parent} · {t.childClass}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {RESULTS && (
        <dl className="mt-8 grid gap-4 rounded-[2rem] border-2 border-border bg-card p-6 text-center shadow-soft sm:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Learners</dt>
            <dd className="font-display text-3xl font-bold text-brand">{RESULTS.learners}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Lessons completed</dt>
            <dd className="font-display text-3xl font-bold text-brand">{RESULTS.lessonsCompleted}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Average score improvement</dt>
            <dd className="font-display text-3xl font-bold text-brand">{RESULTS.averageScoreImprovement}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}

export function PartnersSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
      <SectionHeading eyebrow="Partners">Schools and employers</SectionHeading>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="flex flex-col rounded-[2rem] border-2 border-border bg-card p-7 shadow-soft">
          <School className="h-8 w-8 text-brand" aria-hidden="true" />
          <h3 className="mt-3 font-display text-xl font-bold">For schools</h3>
          <p className="mt-2 leading-7 text-muted-foreground">
            Bring MatchlessGrade to your classrooms with a teacher dashboard and termly reports for parents. Start with
            a free 4-week pilot.
          </p>
          <Link
            href="/schools"
            className="mt-4 font-display text-sm font-bold text-brand underline-offset-4 hover:underline"
          >
            Partner with us
          </Link>
        </article>
        <article className="flex flex-col rounded-[2rem] border-2 border-border bg-card p-7 shadow-soft">
          <Building2 className="h-8 w-8 text-brand" aria-hidden="true" />
          <h3 className="mt-3 font-display text-xl font-bold">For employers</h3>
          <p className="mt-2 leading-7 text-muted-foreground">
            Offer MatchlessGrade as a staff benefit for your employees&apos; children, with corporate rates and payroll
            deduction.
          </p>
          <Link
            href="/for-employers"
            className="mt-4 font-display text-sm font-bold text-brand underline-offset-4 hover:underline"
          >
            Learn more
          </Link>
        </article>
      </div>
    </section>
  )
}

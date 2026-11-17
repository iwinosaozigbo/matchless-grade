export type AgeKey = "all" | "1-5" | "6-12" | "13-17"

const VALID_AGES: AgeKey[] = ["all", "1-5", "6-12", "13-17"]

export function normalizeAge(raw: string | null | undefined): AgeKey {
  return raw && (VALID_AGES as string[]).includes(raw) ? (raw as AgeKey) : "all"
}

export const AGE_OPTIONS: { value: AgeKey; label: string; short: string; href: string }[] = [
  { value: "all", label: "All ages", short: "All ages", href: "/" },
  { value: "1-5", label: "Ages 1–5", short: "1–5", href: "/?age=1-5" },
  { value: "6-12", label: "Ages 6–12", short: "6–12", href: "/?age=6-12" },
  { value: "13-17", label: "Ages 13–17", short: "13–17", href: "/?age=13-17" },
]

type AgeCopy = {
  eyebrow: string
  headline: string
  headlineAccent: string
  body: string
  note: string
  sectionEyebrow: string
  sectionHeading: string
  sectionIntro: string
  ctaLabel: string
}

/**
 * Copy adapted in tone per age group. All facts (subjects, features, CTA destination)
 * come from the real homepage content in lib/lessons-data.ts — nothing invented here.
 */
export const AGE_COPY: Record<Exclude<AgeKey, "all">, AgeCopy> = {
  "1-5": {
    eyebrow: "For families with little ones",
    headline: "A gentle first step into",
    headlineAccent: "learning together",
    body: "Matchless Grade brings short video lessons, simple flashcards and friendly quizzes into one place, so you can sit down with your child and explore a subject at their own pace.",
    note: "Every lesson stays in one calm space — no separate apps, no clutter, just you and your child.",
    sectionEyebrow: "Explore together",
    sectionHeading: "A few places to start",
    sectionIntro: "Browse the lesson library with your child and pick whatever catches their eye today.",
    ctaLabel: "Join for free",
  },
  "6-12": {
    eyebrow: "Discovery mode",
    headline: "Explore worlds, earn XP,",
    headlineAccent: "level up",
    body: "Every subject is broken into bite-sized video lessons, quizzes and flashcards. Finish one to earn XP, unlock badges and climb the leaderboard.",
    note: "Kids explore at their own speed while parents can follow along and see progress.",
    sectionEyebrow: "Discovery pathways",
    sectionHeading: "Pick your next mission",
    sectionIntro: "Each pathway below is a real subject in our lesson library — pick one and start earning XP.",
    ctaLabel: "Start exploring",
  },
  "13-17": {
    eyebrow: "Built for independent learners",
    headline: "Learn on",
    headlineAccent: "your terms",
    body: "Work through video lessons, quizzes and flashcards across mathematics, mental-maths training, science, coding and reading. Track XP and progress as you go, at whatever pace suits you.",
    note: "No mascots, no filler — just clear lessons and a straightforward way to track progress.",
    sectionEyebrow: "The library",
    sectionHeading: "Subjects worth your time",
    sectionIntro: "A straightforward look at what's inside — pick a subject and get started.",
    ctaLabel: "Create an account",
  },
}

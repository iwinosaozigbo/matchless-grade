"use client"

import type { ProgramId } from "@/lib/program-pricing"
import { createClient } from "@/lib/supabase/client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type GameState = {
  xp: number
  completedLessons: string[] // "subjectId/lessonId"
  perfectQuizzes: string[]
  quizzesPassed: number
  flashcardsReviewed: number
  streak: number
  unlockedBadges: string[]
}

export type Badge = {
  id: string
  name: string
  description: string
  icon: string // lucide icon name
  color: string // token name
  test: (s: GameState) => boolean
}

/* ------------------------------------------------------------------ */
/*  Leveling                                                          */
/* ------------------------------------------------------------------ */

// XP required to advance FROM the given level to the next one.
function xpForLevel(level: number) {
  return 100 + (level - 1) * 60
}

export function levelInfo(xp: number) {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  const needed = xpForLevel(level)
  return {
    level,
    current: remaining,
    needed,
    progress: Math.round((remaining / needed) * 100),
  }
}

/* ------------------------------------------------------------------ */
/*  Badges                                                            */
/* ------------------------------------------------------------------ */

export const BADGES: Badge[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your very first lesson",
    icon: "Footprints",
    color: "brand",
    test: (s) => s.completedLessons.length >= 1,
  },
  {
    id: "quiz-whiz",
    name: "Quiz Whiz",
    description: "Pass 3 quizzes",
    icon: "Brain",
    color: "grape",
    test: (s) => s.quizzesPassed >= 3,
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Ace a quiz with 100%",
    icon: "Target",
    color: "bubblegum",
    test: (s) => s.perfectQuizzes.length >= 1,
  },
  {
    id: "card-shark",
    name: "Card Shark",
    description: "Review 10 flashcards",
    icon: "Layers",
    color: "mint",
    test: (s) => s.flashcardsReviewed >= 10,
  },
  {
    id: "rising-star",
    name: "Rising Star",
    description: "Reach Level 3",
    icon: "Star",
    color: "sun",
    test: (s) => levelInfo(s.xp).level >= 3,
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Complete 3 lessons",
    icon: "GraduationCap",
    color: "sky",
    test: (s) => s.completedLessons.length >= 3,
  },
  {
    id: "xp-master",
    name: "XP Master",
    description: "Earn 500 XP",
    icon: "Rocket",
    color: "brand",
    test: (s) => s.xp >= 500,
  },
]

/* ------------------------------------------------------------------ */
/*  Leaderboard (static peers + live player)                          */
/* ------------------------------------------------------------------ */

export type Peer = { name: string; xp: number; you?: boolean; avatar: string }

const PEERS: Omit<Peer, "you">[] = [
  { name: "Kameron Porter", xp: 1809, avatar: "🦁" },
  { name: "Alice Koller", xp: 1240, avatar: "🦊" },
  { name: "Michael Kopfler", xp: 980, avatar: "🐨" },
  { name: "Peter Dinklage", xp: 610, avatar: "🐵" },
  { name: "Sara Nolan", xp: 320, avatar: "🐸" },
]

/* ------------------------------------------------------------------ */
/*  Store                                                             */
/* ------------------------------------------------------------------ */

export type SignupProfile = {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  ageGroup: string
  gradeLevel: string
  school: string
  guardianName: string
  guardianPhone: string
  productId: ProgramId
}

const STORAGE_KEY = "study_pilot_state"
const AUTH_KEY = "study_pilot_auth"
const ACCESS_KEY = "study_pilot_access"
const PROFILE_KEY = "study_pilot_profile"

const INITIAL: GameState = {
  xp: 0,
  completedLessons: [],
  perfectQuizzes: [],
  quizzesPassed: 0,
  flashcardsReviewed: 0,
  streak: 1,
  unlockedBadges: [],
}

type Ctx = {
  ready: boolean
  state: GameState
  level: ReturnType<typeof levelInfo>
  badges: Badge[]
  isAuthed: boolean
  hasAccess: boolean
  username: string | null
  login: (u: string, p: string) => boolean
  completeSignup: (profile: SignupProfile) => void
  profile: SignupProfile | null
  logout: () => Promise<void>
  completeLesson: (id: string, xp: number) => void
  recordQuiz: (lessonId: string, correct: number, total: number) => void
  reviewFlashcards: (count: number) => void
  leaderboard: Peer[]
  toast: Badge | null
  dismissToast: () => void
}

const GameContext = createContext<Ctx | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [state, setState] = useState<GameState>(INITIAL)
  const [isAuthed, setIsAuthed] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [profile, setProfile] = useState<SignupProfile | null>(null)
  const [toast, setToast] = useState<Badge | null>(null)
  const prevBadges = useRef<string[]>([])

  // hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = { ...INITIAL, ...JSON.parse(raw) }
        setState(parsed)
        prevBadges.current = parsed.unlockedBadges ?? []
      }
      const auth = localStorage.getItem(AUTH_KEY)
      if (auth) {
        setIsAuthed(true)
        setUsername(auth)
      }
      if (localStorage.getItem(ACCESS_KEY) === "1") {
        setHasAccess(true)
      }
      const rawProfile = localStorage.getItem(PROFILE_KEY)
      if (rawProfile) {
        setProfile(JSON.parse(rawProfile) as SignupProfile)
      }
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  // persist + recompute badges
  useEffect(() => {
    if (!ready) return
    const unlocked = BADGES.filter((b) => b.test(state)).map((b) => b.id)
    const newlyUnlocked = unlocked.filter((id) => !prevBadges.current.includes(id))

    if (newlyUnlocked.length && prevBadges.current.length !== 0) {
      const badge = BADGES.find((b) => b.id === newlyUnlocked[0]) ?? null
      setToast(badge)
    }

    if (unlocked.length !== state.unlockedBadges.length) {
      setState((s) => ({ ...s, unlockedBadges: unlocked }))
    }
    prevBadges.current = unlocked

    const { unlockedBadges, ...rest } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, unlockedBadges: unlocked }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready])

  const login = useCallback((u: string, p: string) => {
    if (u.trim().toLowerCase() === "test" && p === "admin") {
      setIsAuthed(true)
      setUsername(u.trim())
      localStorage.setItem(AUTH_KEY, u.trim())
      // demo account comes with full access
      setHasAccess(true)
      localStorage.setItem(ACCESS_KEY, "1")
      return true
    }
    return false
  }, [])

  // Called after a verified Flutterwave payment: create the account and unlock lessons.
  const completeSignup = useCallback((p: SignupProfile) => {
    const name = p.username.trim()
    setIsAuthed(true)
    setUsername(name)
    localStorage.setItem(AUTH_KEY, name)
    setHasAccess(true)
    localStorage.setItem(ACCESS_KEY, "1")
    setProfile(p)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  }, [])

  const logout = useCallback(async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut({ scope: "local" })
    if (error) throw error

    setIsAuthed(false)
    setHasAccess(false)
    setUsername(null)
    setProfile(null)
    setToast(null)
    setState(INITIAL)
    prevBadges.current = []
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(PROFILE_KEY)
  }, [])

  const completeLesson = useCallback((id: string, xp: number) => {
    setState((s) => {
      if (s.completedLessons.includes(id)) return s
      return { ...s, completedLessons: [...s.completedLessons, id], xp: s.xp + xp }
    })
  }, [])

  const recordQuiz = useCallback((lessonId: string, correct: number, total: number) => {
    setState((s) => {
      const gained = correct * 15
      const perfect = correct === total
      return {
        ...s,
        xp: s.xp + gained,
        quizzesPassed: s.quizzesPassed + 1,
        perfectQuizzes:
          perfect && !s.perfectQuizzes.includes(lessonId)
            ? [...s.perfectQuizzes, lessonId]
            : s.perfectQuizzes,
      }
    })
  }, [])

  const reviewFlashcards = useCallback((count: number) => {
    setState((s) => ({
      ...s,
      flashcardsReviewed: s.flashcardsReviewed + count,
      xp: s.xp + count * 5,
    }))
  }, [])

  const level = useMemo(() => levelInfo(state.xp), [state.xp])
  const badges = BADGES

  const leaderboard = useMemo<Peer[]>(() => {
    const you: Peer = { name: username ? `${username} (You)` : "You", xp: state.xp, you: true, avatar: "🚀" }
    return [...PEERS.map((p) => ({ ...p })), you].sort((a, b) => b.xp - a.xp)
  }, [state.xp, username])

  const value: Ctx = {
    ready,
    state,
    level,
    badges,
    isAuthed,
    hasAccess,
    username,
    login,
    completeSignup,
    profile,
    logout,
    completeLesson,
    recordQuiz,
    reviewFlashcards,
    leaderboard,
    toast,
    dismissToast: () => setToast(null),
  }

  return (
    <GameContext.Provider value={value}>
      {children}
      <AchievementToast badge={toast} onClose={() => setToast(null)} />
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}

/* ------------------------------------------------------------------ */
/*  Achievement toast                                                 */
/* ------------------------------------------------------------------ */

function AchievementToast({ badge, onClose }: { badge: Badge | null; onClose: () => void }) {
  useEffect(() => {
    if (!badge) return
    const t = setTimeout(onClose, 4200)
    return () => clearTimeout(t)
  }, [badge, onClose])

  if (!badge) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 px-4">
      <div className="animate-pop flex items-center gap-4 rounded-3xl border-2 border-sun bg-card px-5 py-4 shadow-soft">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun text-2xl">🏆</div>
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Achievement unlocked!
          </p>
          <p className="font-display text-lg font-bold leading-tight">{badge.name}</p>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
        </div>
      </div>
    </div>
  )
}

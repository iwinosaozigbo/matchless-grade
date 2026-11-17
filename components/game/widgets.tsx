"use client"

import {
  Brain,
  Footprints,
  GraduationCap,
  Layers,
  Lock,
  Rocket,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react"
import { BADGES, useGame, type Badge } from "@/lib/game-store"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  Footprints,
  Brain,
  Target,
  Layers,
  Star,
  GraduationCap,
  Rocket,
}

const COLOR_BG: Record<string, string> = {
  brand: "bg-brand text-brand-foreground",
  sun: "bg-sun text-sun-foreground",
  grape: "bg-grape text-white",
  mint: "bg-mint text-white",
  bubblegum: "bg-bubblegum text-white",
  sky: "bg-sky text-white",
}

/* ---------------- Level ring ---------------- */

export function LevelRing({ size = 72 }: { size?: number }) {
  const { level } = useGame()
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (level.progress / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-secondary" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="fill-none stroke-brand transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-lg font-bold">{level.level}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Lvl</span>
      </div>
    </div>
  )
}

/* ---------------- XP bar ---------------- */

export function XpBar({ showLabel = true }: { showLabel?: boolean }) {
  const { level, state } = useGame()
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-display font-semibold">Level {level.level}</span>
          <span className="text-muted-foreground">
            {level.current} / {level.needed} XP
          </span>
        </div>
      )}
      <div className="h-3.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-sky transition-all duration-700"
          style={{ width: `${level.progress}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Total earned: <span className="font-semibold text-foreground">{state.xp} XP</span>
        </p>
      )}
    </div>
  )
}

/* ---------------- Badge grid ---------------- */

export function BadgeGrid() {
  const { state } = useGame()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {BADGES.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} unlocked={state.unlockedBadges.includes(badge.id)} />
      ))}
    </div>
  )
}

function BadgeCard({ badge, unlocked }: { badge: Badge; unlocked: boolean }) {
  const Icon = ICONS[badge.icon] ?? Star
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition-all",
        unlocked ? "border-transparent bg-card shadow-toy" : "border-dashed border-border bg-secondary/40",
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl",
          unlocked ? COLOR_BG[badge.color] : "bg-secondary text-muted-foreground",
        )}
      >
        {unlocked ? <Icon className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
      </div>
      <div>
        <p className={cn("font-display text-sm font-bold leading-tight", !unlocked && "text-muted-foreground")}>
          {badge.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{badge.description}</p>
      </div>
    </div>
  )
}

/* ---------------- Leaderboard ---------------- */

export function Leaderboard() {
  const { leaderboard } = useGame()
  return (
    <div className="flex flex-col gap-2.5">
      {leaderboard.map((p, i) => {
        const rank = i + 1
        return (
          <div
            key={p.name}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors",
              p.you ? "border-brand bg-brand/5" : "border-transparent bg-secondary/50",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
                rank === 1
                  ? "bg-sun text-sun-foreground"
                  : rank === 2
                    ? "bg-sky text-white"
                    : rank === 3
                      ? "bg-bubblegum text-white"
                      : "bg-secondary text-muted-foreground",
              )}
            >
              {rank}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-lg shadow-sm">
              {p.avatar}
            </div>
            <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">{p.name}</span>
            {rank === 1 && <Trophy className="h-4 w-4 text-sun" />}
            <span className="font-display text-sm font-bold text-brand">{p.xp.toLocaleString()}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Stat card ---------------- */

const TEXT_COLOR: Record<string, string> = {
  brand: "text-brand",
  sun: "text-sun",
  grape: "text-grape",
  mint: "text-mint",
  bubblegum: "text-bubblegum",
  sky: "text-sky",
}

export function StatCard({
  label,
  value,
  color = "brand",
}: {
  label: string
  value: string | number
  color?: keyof typeof TEXT_COLOR
}) {
  return (
    <div className="rounded-3xl border-2 border-border bg-card p-4 shadow-toy">
      <p className={cn("font-display text-2xl font-bold", TEXT_COLOR[color])}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

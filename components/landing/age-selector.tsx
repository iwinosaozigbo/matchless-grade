import Link from "next/link"
import { cn } from "@/lib/utils"
import { AGE_OPTIONS, type AgeKey } from "@/lib/age-variants"

export function AgeSelector({ current }: { current: AgeKey }) {
  const activeLabel = AGE_OPTIONS.find((o) => o.value === current)?.label ?? "All ages"

  return (
    <nav aria-label="Explore by age" className="relative z-10 border-b border-border/70 bg-card/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <span className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Explore by age
        </span>
        <div className="grid grid-cols-2 gap-2 sm:inline-flex sm:gap-1 sm:rounded-full sm:border-2 sm:border-border sm:bg-secondary/60 sm:p-1">
          {AGE_OPTIONS.map((opt) => {
            const active = opt.value === current
            return (
              <Link
                key={opt.value}
                href={opt.href}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center rounded-full border-2 px-4 py-2.5 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:border-0 sm:py-2",
                  active
                    ? "border-brand bg-brand text-brand-foreground shadow-toy-brand"
                    : "border-border bg-card text-muted-foreground hover:text-foreground sm:bg-transparent sm:hover:bg-card",
                )}
              >
                {opt.short}
              </Link>
            )
          })}
        </div>
      </div>
      {/* accessible live announcement of the active age range */}
      <p aria-live="polite" className="sr-only">
        Showing the {activeLabel} experience
      </p>
    </nav>
  )
}

import {
  Atom,
  BookOpen,
  Divide,
  Lightbulb,
  Plus,
  Sigma,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react"

type Shape = {
  Icon: LucideIcon
  className: string
  size: number
  delay: string
}

const SHAPES: Shape[] = [
  { Icon: Plus, className: "left-[6%] top-[12%] text-brand", size: 30, delay: "0s" },
  { Icon: Star, className: "left-[88%] top-[8%] text-sun", size: 28, delay: "0.6s" },
  { Icon: Sigma, className: "left-[72%] top-[18%] text-grape", size: 32, delay: "1.2s" },
  { Icon: Divide, className: "left-[14%] top-[30%] text-mint", size: 26, delay: "0.9s" },
  { Icon: Atom, className: "left-[90%] top-[40%] text-sky", size: 30, delay: "0.3s" },
  { Icon: Sparkles, className: "left-[4%] top-[52%] text-bubblegum", size: 26, delay: "1.5s" },
  { Icon: BookOpen, className: "left-[82%] top-[62%] text-brand", size: 28, delay: "0.4s" },
  { Icon: Lightbulb, className: "left-[24%] top-[70%] text-sun", size: 26, delay: "1.1s" },
  { Icon: Star, className: "left-[50%] top-[84%] text-mint", size: 20, delay: "0.7s" },
  { Icon: Plus, className: "left-[62%] top-[90%] text-bubblegum", size: 22, delay: "1.4s" },
  { Icon: Sparkles, className: "left-[12%] top-[92%] text-grape", size: 22, delay: "0.2s" },
  { Icon: Divide, className: "left-[94%] top-[80%] text-sky", size: 22, delay: "1.0s" },
]

export function FloatingShapes({ count = SHAPES.length }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {SHAPES.slice(0, count).map((s, i) => (
        <span
          key={i}
          className={`animate-float absolute opacity-70 ${s.className}`}
          style={{ animationDelay: s.delay }}
        >
          <s.Icon width={s.size} height={s.size} strokeWidth={2.5} />
        </span>
      ))}
    </div>
  )
}

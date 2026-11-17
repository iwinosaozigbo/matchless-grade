"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type Variant = "brand" | "sun" | "ghost" | "outline"

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:pointer-events-none select-none"

const sizes = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-7 text-base",
  lg: "h-14 px-9 text-lg",
}

const variants: Record<Variant, string> = {
  brand: "bg-brand text-brand-foreground shadow-toy-brand hover:brightness-105",
  sun: "bg-sun text-sun-foreground shadow-toy-sun hover:brightness-105",
  ghost: "bg-transparent text-foreground hover:bg-secondary",
  outline: "bg-card text-foreground border-2 border-border shadow-toy hover:-translate-y-0.5",
}

type CommonProps = {
  variant?: Variant
  size?: keyof typeof sizes
  className?: string
}

export function PillButton({
  variant = "brand",
  size = "md",
  className,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />
}

export function PillLink({
  variant = "brand",
  size = "md",
  className,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return <Link className={cn(base, sizes[size], variants[variant], className)} {...props} />
}

"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Tag } from "lucide-react"
import { formatNgn, getProgramPriceNgn, isEarlyBird, PROGRAMS } from "@/lib/program-pricing"
import { Reveal } from "@/components/reveal"
import { SimaLocalizedPrice } from "@/components/sima/sima-localized-price"

export function PricingSection() {
  const now = Date.now()
  const earlyBird = isEarlyBird(now)

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-brand">
          <Tag className="h-4 w-4" />
          Clear pricing
        </p>
        <h2 className="mt-2 text-balance font-display text-4xl font-bold sm:text-5xl">
          Simple plans, priced like school fees.
        </h2>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          Every program is a monthly recurring subscription, charged automatically to your card each month until you cancel. SIMA prices show an estimated local equivalent, while checkout is processed in NGN.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROGRAMS.filter((product) => product.id !== "english-basic-1" && product.id !== "english-basic-2-3").map((product, index) => {
          const price = getProgramPriceNgn(product, now)
          return (
            <Reveal key={product.id} delay={index * 80}>
              <article className="flex h-full flex-col rounded-[2rem] border-2 border-border bg-card p-6 shadow-soft">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sun/80 px-3 py-1 font-display text-xs font-bold text-sun-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  {earlyBird ? "Early bird" : "Launch rate"}
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{product.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{product.description}</p>
                <div className={`mt-5 flex items-baseline gap-2 ${product.id === "sima-abacus" ? "flex-wrap gap-x-2 gap-y-0" : ""}`}>
                  {product.id === "sima-abacus" ? (
                    <SimaLocalizedPrice amountNgn={price} />
                  ) : (
                    <span className="font-sans text-4xl font-bold text-foreground">{formatNgn(price)}</span>
                  )}
                  <span className="text-sm font-semibold text-muted-foreground">/month</span>
                </div>
                {earlyBird && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    At launch: {product.id === "sima-abacus" ? (
                      <SimaLocalizedPrice amountNgn={product.launchPriceNgn} className="font-semibold text-foreground" />
                    ) : (
                      <span className="font-semibold text-foreground">{formatNgn(product.launchPriceNgn)}</span>
                    )}/month
                  </p>
                )}
                <Link
                  href={product.id === "sima-abacus" ? "/sima-abacus" : product.id === "english" ? "/login?next=%2Flearn" : `/signup?product=${product.id}`}
                  className="mt-auto flex items-center justify-center gap-2 rounded-full bg-sun px-4 py-3.5 font-display text-sm font-bold text-sun-foreground shadow-toy-sun transition-transform hover:-translate-y-0.5"
                >
                  {product.id === "english" ? "Sign in to enroll" : `Choose ${product.name}`}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </Reveal>
          )
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Monthly recurring billing by card. Cancel any time. Secure checkout by Flutterwave.
      </p>
    </section>
  )
}

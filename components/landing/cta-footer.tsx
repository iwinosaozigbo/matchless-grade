import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { PillLink } from "@/components/pill-button"
import { FloatingShapes } from "@/components/floating-shapes"

export function CtaFooter() {
  return (
    <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-border bg-card bg-dots px-6 py-14 text-center text-card-foreground shadow-soft sm:px-12">
        <FloatingShapes count={8} />
        <div className="relative z-10 mx-auto max-w-xl">
          <div className="animate-float mx-auto h-32 w-32 overflow-hidden rounded-[1.75rem] border-4 border-card shadow-toy">
            <Image
              src="/login-fox.png"
              alt=""
              width={140}
              height={140}
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-balance font-display text-4xl font-bold sm:text-5xl">
            The first lesson is <span className="text-brand">on us</span>
          </h2>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">
            Join thousands of curious kids learning through play. No card required — just curiosity.
          </p>
          <div className="mt-7 flex justify-center">
            <PillLink href="/login" variant="sun" size="lg">
              Start learning free
              <ArrowRight className="h-5 w-5" />
            </PillLink>
          </div>
        </div>
      </div>

    </section>
  )
}

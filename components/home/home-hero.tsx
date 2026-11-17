import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { PillLink } from "@/components/pill-button"
import { FloatingShapes } from "@/components/floating-shapes"
import { FREE_TEST_HREF } from "@/lib/site-config"

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-background bg-dots pb-16 pt-14 text-foreground sm:pb-24 sm:pt-16">
      <FloatingShapes />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <h1 className="text-balance font-display text-4xl font-bold leading-[1.02] sm:text-6xl">
            Maths your child will actually want to <span className="text-brand">practise.</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Short video lessons, instant practice and rewards that keep pupils and students coming back, every day.
            Built for the Nigerian curriculum, BECE and WAEC.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PillLink href={FREE_TEST_HREF} variant="sun" size="lg" className="whitespace-nowrap">
              Take the free maths test
              <ArrowRight className="h-5 w-5" />
            </PillLink>
            <PillLink href="#pricing" variant="outline" size="lg" className="whitespace-nowrap">
              See plans &amp; pricing
            </PillLink>
          </div>
          <p className="mt-5 text-sm font-semibold text-muted-foreground">
            Free 15-minute test · Report sent to your WhatsApp · No card needed
          </p>
        </div>

        <div className="relative flex justify-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border-4 border-card bg-card shadow-soft lg:max-w-lg">
            <Image
              src="/teens-hero.jpg"
              alt="Three secondary-school students in navy uniforms holding mathematics textbooks in a classroom"
              width={620}
              height={620}
              priority
              sizes="(min-width: 1024px) 512px, 90vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

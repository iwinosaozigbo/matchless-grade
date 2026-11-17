"use client"

import { useSearchParams } from "next/navigation"
import { normalizeAge } from "@/lib/age-variants"
import type { MathLevel } from "@/lib/math-curriculum"
import { AgeSelector } from "@/components/landing/age-selector"
import { AgeHero } from "@/components/landing/age-hero"
import { AgeDiscover } from "@/components/landing/age-discover"
import { Hero } from "@/components/landing/hero"
import { MathCurriculum } from "@/components/landing/math-curriculum"
import { PricingSection } from "@/components/landing/pricing-section"
import { SubjectsSection } from "@/components/landing/subjects-section"
import { GamifiedSection } from "@/components/landing/gamified-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CtaFooter } from "@/components/landing/cta-footer"
import { SiteFooter } from "@/components/home/home-faq-cta"
import { EarlyBirdPopup } from "@/components/landing/early-bird-popup"

/**
 * Owns the age filter state (read from the ?age= search param) so the header
 * and age selector stay mounted and stable while only the content below
 * fades/re-renders when the selection changes.
 */
export function AgeExperience({ mathLevels }: { mathLevels: MathLevel[] }) {
  const searchParams = useSearchParams()
  const age = normalizeAge(searchParams.get("age"))

  return (
    <>
      <AgeSelector current={age} />

      <div key={age} className="animate-agefade">
        {age === "all" ? (
          <>
            <Hero />
            <MathCurriculum levels={mathLevels} />
            <SubjectsSection />
            <PricingSection />
            <GamifiedSection />
            <HowItWorks />
          </>
        ) : (
          <>
            <AgeHero age={age} />
            <AgeDiscover age={age} />
          </>
        )}
      </div>

      <CtaFooter />
      <SiteFooter />
      <EarlyBirdPopup />
    </>
  )
}

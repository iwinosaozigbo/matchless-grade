import type { Metadata } from "next"
import { SiteNav } from "@/components/landing/site-nav"
import { PricingSection } from "@/components/landing/pricing-section"
import { FaqSection, FinalCta, SiteFooter } from "@/components/home/home-faq-cta"

export const metadata: Metadata = {
  title: "Pricing | MatchlessGrade",
  description:
    "Simple monthly plans for the Mathematics bundle and SIMA Abacus. Billed monthly by card, cancel any time.",
  alternates: { canonical: "/pricing" },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}

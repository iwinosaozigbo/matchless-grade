import type { Metadata } from "next"
import { SiteNav } from "@/components/landing/site-nav"
import { PricingSection } from "@/components/landing/pricing-section"
import { HomeHero } from "@/components/home/home-hero"
import {
  HowItWorksSection,
  ParentsSection,
  PartnersSection,
  ProblemSection,
  ProgrammesSection,
  ProofSection,
} from "@/components/home/home-sections"
import { FaqSection, FinalCta, SiteFooter } from "@/components/home/home-faq-cta"
import { WhatsAppButton } from "@/components/home/whatsapp-button"
import { FAQS } from "@/lib/home-content"
import { SITE_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/lib/site-config"

const TITLE = "MatchlessGrade – Make Maths Your Child's Best Subject"
const DESCRIPTION =
  "Game-based maths lessons from Nursery to SSS3 in Nigeria, plus SIMA Abacus mental maths. Take the free maths level test today."
const SOCIAL_TITLE = "Is your child really on track in maths? Find out free."
const SOCIAL_DESCRIPTION =
  "A 15-minute maths test. Get a free report on your child's level and weak topics."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "maths lessons for JSS students",
    "WAEC maths preparation",
    "BECE maths practice",
    "online maths tutor Lagos",
    "abacus mental maths for kids Nigeria",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "A smiling student holding a phone showing XP and badges" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: ["/og-image.png"],
  },
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/matchless-grade-logo.png`,
    description: DESCRIPTION,
    areaServed: "NG",
    ...(WHATSAPP_NUMBER ? { telephone: `+${WHATSAPP_NUMBER}` } : {}),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteNav />
      <main>
        <HomeHero />
        <ProblemSection />
        <HowItWorksSection />
        <ProgrammesSection />
        <ParentsSection />
        <ProofSection />
        <PricingSection />
        <PartnersSection />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  )
}

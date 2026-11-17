import type { Metadata } from "next"
import { InfoPage } from "@/components/home/info-page"
import { LeadForm } from "@/components/home/lead-form"

export const metadata: Metadata = {
  title: "Free Maths Level Test",
  description:
    "Take a free 15-minute maths test and get a report on your child's level and weak topics, sent to your WhatsApp.",
  alternates: { canonical: "/diagnostic" },
}

export default function DiagnosticPage() {
  return (
    <InfoPage
      title="Find out where your child really stands in maths."
      intro="Tell us about your child and we'll send the free 15-minute maths test straight to your WhatsApp, followed by a report on their level and weak topics."
      bullets={[
        "Free, no card needed",
        "Takes about 15 minutes on any phone",
        "Report on level and weak topics sent to WhatsApp",
      ]}
    >
      <LeadForm
        kind="diagnostic"
        submitLabel="Send me the free test"
        successTitle="You're all set"
        successBody="We'll send the free maths test to you shortly using the details you gave us."
        showClass
      />
    </InfoPage>
  )
}

import type { Metadata } from "next"
import { InfoPage } from "@/components/home/info-page"
import { LeadForm } from "@/components/home/lead-form"
import { whatsappLink } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Contact us | MatchlessGrade",
  description: "Questions about plans, billing or your child's learning? Send us a message and we will reply.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  const chat = whatsappLink()
  return (
    <InfoPage
      title="We're happy to help."
      intro="Ask about plans, billing, cancelling a subscription or anything about your child's learning."
      bullets={[
        "Billing and cancellation questions",
        "Help choosing the right plan",
        "Account or login problems",
      ]}
    >
      <div className="flex flex-col gap-4">
        <LeadForm
          kind="contact"
          submitLabel="Send message"
          successTitle="Message received"
          successBody="Thanks for getting in touch. We will reply as soon as we can."
          showMessage
        />
        {chat && (
          <p className="text-center text-sm text-muted-foreground">
            Prefer WhatsApp?{" "}
            <a
              href={chat}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              Chat with us
            </a>
          </p>
        )}
      </div>
    </InfoPage>
  )
}

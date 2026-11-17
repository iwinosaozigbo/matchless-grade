import type { Metadata } from "next"
import { LegalPage } from "@/components/home/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy | MatchlessGrade",
  description: "How MatchlessGrade collects, uses and protects information about parents and children.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="November 2026"
      intro="MatchlessGrade teaches children maths. Because our learners are children, we collect as little information as we need and we never sell it. This page explains what we collect and why."
      sections={[
        {
          heading: "What we collect",
          body: [
            "Account details: the name and email address of the parent or guardian who creates the account, plus the child's name and class so lessons match their level.",
            "Learning activity: lessons completed, quiz and diagnostic results, and progress over time, so we can show parents how their child is doing.",
            "Enquiries: the name, phone number, email and message you send us when you use the diagnostic, schools, employers or contact forms.",
            "Payment information: card payments are handled by our payment processor, Flutterwave. We do not see or store your full card number.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To run your account, deliver lessons, track progress and show reports to parents and, where applicable, teachers.",
            "To process your monthly subscription and let you manage or cancel it.",
            "To reply to enquiries and to send service messages such as password resets and payment receipts.",
            "To improve our lessons by looking at how learners use them in aggregate.",
          ],
        },
        {
          heading: "Who we share it with",
          body: [
            "We use trusted service providers to operate the site, including hosting, database and authentication, and payments (Flutterwave). They may only use your information to provide their service to us.",
            "If your child is enrolled through a school or employer, we share progress information with that organisation for the purpose of that arrangement.",
            "We do not sell personal information and we do not show advertising to children.",
          ],
        },
        {
          heading: "Children's information",
          body: [
            "Accounts are created and managed by a parent or guardian. If you believe a child has given us information without a parent's consent, please contact us and we will remove it.",
          ],
        },
        {
          heading: "Keeping it safe and how long we keep it",
          body: [
            "Data is stored with access controls and encrypted connections. We keep account and learning data while your account is active and delete or anonymise it within a reasonable time after you ask us to close it, unless the law requires us to keep certain records, such as payment records.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can ask to see, correct or delete the information we hold about you or your child, or stop receiving messages from us, by using our contact page.",
          ],
        },
        {
          heading: "Changes to this policy",
          body: ["If we make significant changes we will update the date at the top of this page."],
        },
      ]}
    />
  )
}

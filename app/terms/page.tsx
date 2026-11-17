import type { Metadata } from "next"
import { LegalPage } from "@/components/home/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service | MatchlessGrade",
  description: "The terms that apply when you use MatchlessGrade, including monthly recurring billing and cancellation.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="November 2026"
      intro="By creating an account or subscribing to MatchlessGrade you agree to these terms. Please read them, especially the section on monthly billing."
      sections={[
        {
          heading: "Who can use MatchlessGrade",
          body: [
            "Accounts must be created by a parent or guardian, or by a school or employer on behalf of a learner. You are responsible for the activity on your account and for keeping your password safe.",
          ],
        },
        {
          heading: "Monthly recurring subscriptions",
          body: [
            "Every MatchlessGrade programme, including the Mathematics bundle and SIMA Abacus, is a monthly recurring subscription. When you subscribe, your card is charged the monthly price shown at checkout, and then automatically charged again every month until you cancel.",
            "Prices are shown in Naira (NGN) and are the prices in effect when you subscribe. An early bird price, where offered, is the price shown on the page at the time you subscribe. For SIMA Abacus, any local currency amount shown is only an estimate; the charge is made in NGN.",
            "Payments are processed securely by Flutterwave.",
          ],
        },
        {
          heading: "Cancelling",
          body: [
            "You can cancel at any time. Cancelling stops future monthly charges. Your access follows the period you have paid for.",
            "If you think you have been charged in error, contact us through the contact page and we will review it promptly.",
          ],
        },
        {
          heading: "Acceptable use",
          body: [
            "Do not share your login with people outside your household, copy or resell our lessons, or try to disrupt or gain unauthorised access to the service.",
          ],
        },
        {
          heading: "Our content",
          body: [
            "The lessons, games, questions and designs on MatchlessGrade belong to us or our licensors. You may use them for your child's learning while your subscription is active.",
          ],
        },
        {
          heading: "Results",
          body: [
            "We work hard to help children improve, but we cannot guarantee particular exam results or grades, which depend on many factors including practice and effort.",
          ],
        },
        {
          heading: "Changes and availability",
          body: [
            "We may update the service and these terms from time to time. If we change the price of an existing subscription we will tell you before it takes effect. We aim to keep the service available but cannot promise it will always be uninterrupted.",
          ],
        },
        {
          heading: "Contact",
          body: ["Questions about these terms? Reach us through the contact page."],
        },
      ]}
    />
  )
}

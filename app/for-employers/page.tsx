import type { Metadata } from "next"
import { InfoPage } from "@/components/home/info-page"
import { LeadForm } from "@/components/home/lead-form"

export const metadata: Metadata = {
  title: "MatchlessGrade for Employers",
  description:
    "Offer MatchlessGrade as a staff benefit for employees' children, with corporate rates and payroll deduction.",
  alternates: { canonical: "/for-employers" },
}

export default function EmployersPage() {
  return (
    <InfoPage
      title="A staff benefit parents will actually use."
      intro="Offer your employees' children better maths results at a corporate rate."
      bullets={["Corporate rates for teams", "Payroll deduction available", "Simple onboarding for staff"]}
    >
      <LeadForm
        kind="employer"
        organisationLabel="Company name"
        submitLabel="Talk to us"
        successTitle="Thanks, we'll be in touch"
        successBody="Our team will contact you shortly to discuss corporate rates."
        showMessage
      />
    </InfoPage>
  )
}

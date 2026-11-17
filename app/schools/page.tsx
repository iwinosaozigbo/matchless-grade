import type { Metadata } from "next"
import { InfoPage } from "@/components/home/info-page"
import { LeadForm } from "@/components/home/lead-form"

export const metadata: Metadata = {
  title: "MatchlessGrade for Schools",
  description:
    "Bring game-based maths to your classrooms with a teacher dashboard and termly parent reports. Start with a free 4-week pilot.",
  alternates: { canonical: "/schools" },
}

export default function SchoolsPage() {
  return (
    <InfoPage
      title="Bring MatchlessGrade to your school."
      intro="Give every pupil engaging maths practice and give teachers the data to see who needs help."
      bullets={[
        "Teacher dashboard showing class progress and weak topics",
        "Termly progress reports for parents",
        "Free 4-week pilot to start",
      ]}
    >
      <LeadForm
        kind="school"
        organisationLabel="School name"
        submitLabel="Request a free pilot"
        successTitle="Thanks, we'll be in touch"
        successBody="Our team will contact you shortly to set up your free 4-week pilot."
        showMessage
      />
    </InfoPage>
  )
}

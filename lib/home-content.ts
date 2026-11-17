export type Testimonial = {
  parent: string
  childClass: string
  quote: string
}

export type ResultsStrip = {
  learners: string
  lessonsCompleted: string
  averageScoreImprovement: string
}

/**
 * Add real parent testimonials here. The "Proof" section on the homepage only
 * renders once at least one testimonial or the results strip is provided.
 */
export const TESTIMONIALS: Testimonial[] = []

/** Fill in with verified numbers to show the results strip. */
export const RESULTS: ResultsStrip | null = null

export const FAQS = [
  {
    q: "Which classes do you cover?",
    a: "Nursery 2 to SSS3 mathematics, our bundled Primary English programme (Grade 1 / Basic 1 and Grade 2 / Basic 2), and SIMA Abacus.",
  },
  {
    q: "Does it work on a phone?",
    a: "Yes. Any smartphone, tablet or computer with internet.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly plans can be cancelled before the next billing date with no penalty.",
  },
  {
    q: "Is it aligned with the school curriculum?",
    a: "Yes. Mathematics lessons follow the Nigerian national curriculum and BECE and WAEC syllabuses. Primary English lessons support classroom reading and grammar.",
  },
] as const

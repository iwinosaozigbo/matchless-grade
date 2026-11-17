import { BookOpenCheck, ChevronDown, LockKeyhole } from "lucide-react"
import { SimaPurchaseButton } from "@/components/sima/purchase-button"
import { ProgramPurchaseButton } from "@/components/learn/program-purchase-button"
import { formatNgn } from "@/lib/program-pricing"
import { SimaLocalizedPrice } from "@/components/sima/sima-localized-price"
import { MATH_COURSE_IDS, stageForMathCourse } from "@/lib/course-catalog"

export function LearnCourseOptions({
  email,
  unlockedMathStages,
  hasSimaAccess,
  mathPriceNgn,
  simaPriceNgn,
  isEarlyBird,
  englishPriceNgn,
}: {
  email: string
  unlockedMathStages: string[]
  hasSimaAccess: boolean
  mathPriceNgn: number
  simaPriceNgn: number
  englishPriceNgn: number
  isEarlyBird: boolean
}) {
  const remainingMathStages = MATH_COURSE_IDS
    .map(stageForMathCourse)
    .filter((stage) => !unlockedMathStages.includes(stage))
  const hasEnglishGrade2Access = unlockedMathStages.includes("Grade 2 English")
  const hasEnglishBasic1Access = unlockedMathStages.includes("Basic 1 English")
  const hasEnglishBasic23Access = unlockedMathStages.includes("Basic 2 & 3 English")
  const hasOptions = remainingMathStages.length > 0 || !hasSimaAccess || !hasEnglishGrade2Access || !hasEnglishBasic1Access || !hasEnglishBasic23Access

  if (!hasOptions) return null

  return (
    <section aria-labelledby="course-options-title" className="mt-10">
      <div className="mb-4">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Course library</p>
        <h2 id="course-options-title" className="mt-1 font-display text-2xl font-bold">Explore available courses</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Locked courses are shown in muted drawers. Open one to see what&apos;s included and subscribe securely (monthly recurring payment).
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {remainingMathStages.length > 0 && (
          <details className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <LockKeyhole className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold text-muted-foreground">Mathematics bundle</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{remainingMathStages.join(" · ")}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Monthly</span>
                <span className="font-display text-lg font-bold text-foreground">{formatNgn(mathPriceNgn)}/month</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/course:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
              <div className="mb-4 flex items-start gap-3 text-sm text-muted-foreground">
                <BookOpenCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>One Mathematics bundle unlocks every class from Nursery 2 to Senior Secondary.</p>
              </div>
              <ProgramPurchaseButton
                email={email}
                productId="mathematics"
                productName="Mathematics bundle"
                amountNgn={mathPriceNgn}
              />
            </div>
          </details>
        )}

        {!hasEnglishBasic1Access && (
          <details className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><LockKeyhole className="size-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block font-display text-base font-bold text-muted-foreground">English · Basic 1</span><span className="mt-0.5 block text-sm text-muted-foreground">Foundational English classes</span></span>
              <span className="shrink-0 text-right"><span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Monthly</span><span className="font-display text-lg font-bold text-foreground">{formatNgn(englishPriceNgn)}/month</span></span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/course:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">Register your learner for Basic 1 English. Lesson materials will appear in your learning path as they are published.</p>
              <ProgramPurchaseButton email={email} productId="english-basic-1" productName="English · Basic 1" amountNgn={englishPriceNgn} />
            </div>
          </details>
        )}

        {!hasEnglishBasic23Access && (
          <details className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><LockKeyhole className="size-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block font-display text-base font-bold text-muted-foreground">English · Basic 2 &amp; 3</span><span className="mt-0.5 block text-sm text-muted-foreground">English classes for Basic 2 and Basic 3</span></span>
              <span className="shrink-0 text-right"><span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Monthly</span><span className="font-display text-lg font-bold text-foreground">{formatNgn(englishPriceNgn)}/month</span></span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/course:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">Choose English for Basic 2 &amp; 3. Lesson materials will appear in your learning path as they are published.</p>
              <ProgramPurchaseButton email={email} productId="english-basic-2-3" productName="English · Basic 2 & 3" amountNgn={englishPriceNgn} />
            </div>
          </details>
        )}

        {!hasEnglishGrade2Access && (
          <details className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <LockKeyhole className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold text-muted-foreground">Grade 2 English · 2nd Term</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">6 video lessons · reading and grammar practice</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Monthly</span>
                <span className="font-display text-lg font-bold text-foreground">{formatNgn(englishPriceNgn)}/month</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/course:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Six short classes covering possessive pronouns, synonyms, gender words, the tion sound, reflexive pronouns, and do/does. Your lessons unlock after Flutterwave confirms payment.
              </p>
              <ProgramPurchaseButton
                email={email}
                productId="english"
                productName="Grade 2 English"
                amountNgn={englishPriceNgn}
              />
            </div>
          </details>
        )}

        {!hasSimaAccess && (
          <details className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <LockKeyhole className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold text-muted-foreground">SIMA Abacus · Basic 1</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">40 video lessons · 13 weekly releases</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Monthly</span>
                <span className="font-display text-lg font-bold text-foreground"><SimaLocalizedPrice amountNgn={simaPriceNgn} />/month</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/course:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                A guided Basic 1 course with practice quizzes and saved progress. {isEarlyBird ? "Early-bird pricing is available before launch." : "Billed monthly until you cancel."}
              </p>
              <SimaPurchaseButton email={email} amountNgn={simaPriceNgn} />
            </div>
          </details>
        )}
      </div>
    </section>
  )
}

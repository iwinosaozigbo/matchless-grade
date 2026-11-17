import { BookOpenCheck, ChevronDown, LockKeyhole } from "lucide-react"
import { SimaPurchaseButton } from "@/components/sima/purchase-button"
import { ProgramPurchaseButton } from "@/components/learn/program-purchase-button"
import { formatNgn, type ProgramId } from "@/lib/program-pricing"
import { SimaLocalizedPrice } from "@/components/sima/sima-localized-price"
import { ENGLISH_COURSE_IDS, MATH_COURSE_IDS, stageForMathCourse } from "@/lib/course-catalog"

export function LearnCourseOptions({
  email,
  unlockedMathStages,
  hasSimaAccess,
  mathPriceNgn,
  simaPriceNgn,
  isEarlyBird,
  englishPriceNgn,
  openProgram,
}: {
  email: string
  unlockedMathStages: string[]
  hasSimaAccess: boolean
  mathPriceNgn: number
  simaPriceNgn: number
  englishPriceNgn: number
  isEarlyBird: boolean
  openProgram?: ProgramId
}) {
  const remainingMathStages = MATH_COURSE_IDS
    .map(stageForMathCourse)
    .filter((stage) => !unlockedMathStages.includes(stage))
  const remainingEnglishStages = ENGLISH_COURSE_IDS
    .map(stageForMathCourse)
    .filter((stage) => !unlockedMathStages.includes(stage))
  const hasOptions = remainingMathStages.length > 0 || remainingEnglishStages.length > 0 || !hasSimaAccess

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
          <details open={openProgram === "mathematics"} className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
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

        {remainingEnglishStages.length > 0 && (
          <details open={openProgram === "english"} className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <LockKeyhole className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold text-muted-foreground">English bundle</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{remainingEnglishStages.join(" · ")}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Monthly</span>
                <span className="font-display text-lg font-bold text-foreground">{formatNgn(englishPriceNgn)}/month</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/course:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-border px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
              <div className="mb-4 flex items-start gap-3 text-sm text-muted-foreground">
                <BookOpenCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  One English bundle unlocks all Primary English classes (Grade 1 / Basic 1 phonics, reading &amp; nouns, and Grade 2 / Basic 2 grammar &amp; vocabulary) with practice quizzes and saved progress.
                </p>
              </div>
              <ProgramPurchaseButton
                email={email}
                productId="english"
                productName="English bundle"
                amountNgn={englishPriceNgn}
              />
            </div>
          </details>
        )}

        {!hasSimaAccess && (
          <details open={openProgram === "sima-abacus"} className="group/course rounded-[1.75rem] border-2 border-border bg-muted/30 shadow-sm">
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

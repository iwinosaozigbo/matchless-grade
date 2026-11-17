export const LAUNCH_DATE = "2026-10-01T00:00:00+01:00"

export const PROGRAMS = [
  {
    id: "mathematics",
    name: "Mathematics bundle",
    description: "Mathematics from Nursery 2 to Senior Secondary, including Nursery 2 & Basic 1, Basic 2-3, Upper Basic, Junior Secondary and Senior Secondary.",
    earlyBirdPriceNgn: 20_000,
    launchPriceNgn: 25_000,
  },
  {
    id: "english",
    name: "Grade 2 English",
    description: "Grade 2 English, 2nd Term: six recorded lessons with practice questions and saved progress.",
    earlyBirdPriceNgn: 20_000,
    launchPriceNgn: 25_000,
  },
  {
    id: "sima-abacus",
    name: "SIMA Abacus",
    description: "SIMA Abacus learning programme.",
    earlyBirdPriceNgn: 25_000,
    launchPriceNgn: 30_000,
  },
] as const

export type ProgramId = (typeof PROGRAMS)[number]["id"]
export type Program = (typeof PROGRAMS)[number]

export function isProgramId(value: unknown): value is ProgramId {
  return typeof value === "string" && PROGRAMS.some((program) => program.id === value)
}

export function getProgram(programId: string | null | undefined): Program | undefined {
  return PROGRAMS.find((program) => program.id === programId)
}

export function isEarlyBird(now: number = Date.now()): boolean {
  return now < new Date(LAUNCH_DATE).getTime()
}

export function getProgramPriceNgn(program: Program, now: number = Date.now()): number {
  return isEarlyBird(now) ? program.earlyBirdPriceNgn : program.launchPriceNgn
}

export function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`
}

export function getCurrentPriceForProgram(programId: string, now: number = Date.now()): number | undefined {
  const program = getProgram(programId)
  return program ? getProgramPriceNgn(program, now) : undefined
}

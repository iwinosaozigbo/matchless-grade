export type SimaQuizQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type PublicSimaQuizQuestion = Pick<SimaQuizQuestion, "id" | "question" | "options">

type LessonQuizSource = {
  id: string
  week_number: number
  lesson_number: number
  quiz_questions: unknown
}

type Strategy = {
  operation: "add" | "subtract"
  amount: number
  base: number
}

const STRATEGIES: Record<string, Strategy> = {
  "4-1": { operation: "add", amount: 4, base: 5 },
  "4-2": { operation: "add", amount: 3, base: 5 },
  "5-1": { operation: "add", amount: 2, base: 5 },
  "5-2": { operation: "add", amount: 1, base: 5 },
  "6-1": { operation: "subtract", amount: 4, base: 5 },
  "6-2": { operation: "subtract", amount: 3, base: 5 },
  "7-1": { operation: "subtract", amount: 2, base: 5 },
  "7-2": { operation: "subtract", amount: 1, base: 5 },
  "8-1": { operation: "add", amount: 9, base: 10 },
  "8-2": { operation: "add", amount: 8, base: 10 },
  "9-1": { operation: "add", amount: 7, base: 10 },
  "9-2": { operation: "add", amount: 6, base: 10 },
  "10-1": { operation: "add", amount: 4, base: 5 },
  "10-2": { operation: "add", amount: 6, base: 10 },
  "11-1": { operation: "add", amount: 2, base: 5 },
  "11-2": { operation: "add", amount: 1, base: 5 },
  "12-1": { operation: "add", amount: 6, base: 10 },
  "12-2": { operation: "add", amount: 7, base: 10 },
  "13-1": { operation: "add", amount: 8, base: 10 },
  "13-2": { operation: "add", amount: 9, base: 10 },
}

function makeQuestion(
  id: string,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): SimaQuizQuestion {
  return { id, question, options, correctIndex, explanation }
}

function strategyQuiz(id: string, strategy: Strategy): SimaQuizQuestion[] {
  const { operation, amount, base } = strategy
  const gap = base - amount
  const operationLabel = operation === "add" ? "add" : "subtract"
  const correctStrategy = operation === "add"
    ? `Add ${base}, then subtract ${gap}`
    : `Add ${gap}, then subtract ${base}`
  const alternatives = operation === "add"
    ? [`Add ${amount}, then subtract ${base}`, `Subtract ${base}, then add ${gap}`, `Add ${gap}, then subtract ${base}`]
    : [`Subtract ${amount}, then add ${base}`, `Add ${base}, then subtract ${gap}`, `Subtract ${base}, then add ${amount}`]
  const start = operation === "add" ? (amount <= 4 ? 2 : 0) : amount + 2
  const result = operation === "add" ? start + amount : start - amount
  const resultOptions = [result, result + 1, Math.max(0, result - 1), result + 2].map(String)
  const gapOptions = [gap, amount, base, gap + 1].map(String)

  return [
    makeQuestion(
      `${id}-strategy`,
      `Which SIMA complement move can ${operationLabel} ${amount} when it cannot be done directly?`,
      [correctStrategy, ...alternatives.filter((option) => option !== correctStrategy)],
      0,
      `${correctStrategy} works because ${base} − ${amount} = ${gap}.`,
    ),
    makeQuestion(
      `${id}-practice`,
      `What is ${start} ${operation === "add" ? "+" : "−"} ${amount}?`,
      resultOptions,
      0,
      `${start} ${operation === "add" ? "+" : "−"} ${amount} = ${result}.`,
    ),
    makeQuestion(
      `${id}-complement`,
      `For ${operation} ${amount} with a ${base}-complement, how many units are in the complement gap?`,
      gapOptions,
      0,
      `The gap is ${base} − ${amount} = ${gap}.`,
    ),
  ]
}

function lowerBeadQuiz(id: string): SimaQuizQuestion[] {
  return [
    makeQuestion(`${id}-lower-value`, "What is the value of one lower bead?", ["1", "2", "5", "10"], 0, "Each lower bead is worth 1."),
    makeQuestion(`${id}-lower-count`, "How many lower beads show 3 on a single rod?", ["1", "2", "3", "5"], 2, "Three lower beads represent 3."),
    makeQuestion(`${id}-lower-total`, "If two lower beads are active, what value do they show?", ["1", "2", "4", "5"], 1, "Two lower beads are worth 1 each, so their total is 2."),
  ]
}

function upperBeadQuiz(id: string): SimaQuizQuestion[] {
  return [
    makeQuestion(`${id}-upper-value`, "What value does the upper bead represent?", ["1", "4", "5", "10"], 2, "The upper bead represents 5."),
    makeQuestion(`${id}-upper-and-lower`, "One upper bead and two lower beads show which number?", ["6", "7", "8", "9"], 1, "The upper bead is 5 and two lower beads add 2, for a total of 7."),
    makeQuestion(`${id}-remove-upper`, "If the rod shows 8 and you subtract the upper bead, what remains?", ["2", "3", "5", "7"], 1, "Subtracting the upper bead removes 5: 8 − 5 = 3."),
  ]
}

function simultaneousAdditionQuiz(id: string): SimaQuizQuestion[] {
  return [
    makeQuestion(`${id}-add-7`, "An upper bead and two lower beads together represent which number?", ["5", "6", "7", "8"], 2, "The beads represent 5 + 2 = 7."),
    makeQuestion(`${id}-add-8`, "What is 5 + 3?", ["7", "8", "9", "10"], 1, "Five plus three equals 8."),
    makeQuestion(`${id}-add-together`, "When adding an upper bead and lower beads together, what is the total change?", ["Only the lower-bead value", "Only 5", "The upper- and lower-bead values added together", "The larger value minus the smaller"], 2, "Add the value of the upper bead (5) and the active lower beads."),
  ]
}

function simultaneousSubtractionQuiz(id: string): SimaQuizQuestion[] {
  return [
    makeQuestion(`${id}-subtract-7`, "What is 8 − 5 − 2?", ["0", "1", "2", "3"], 1, "8 − 5 − 2 = 1."),
    makeQuestion(`${id}-subtract-8`, "What is 9 − 5 − 3?", ["0", "1", "2", "3"], 1, "9 − 5 − 3 = 1."),
    makeQuestion(`${id}-subtract-together`, "Removing an upper bead and two lower beads reduces the rod by how much?", ["2", "5", "6", "7"], 2, "The upper bead is 5 and two lower beads are 2, so the total removed is 7."),
  ]
}

function copyQuestion(question: SimaQuizQuestion, id: string): SimaQuizQuestion {
  return { ...question, id }
}

function revisionQuiz(week: number, id: string): SimaQuizQuestion[] {
  if (week === 1) {
    return [
      copyQuestion(lowerBeadQuiz(id)[0], `${id}-review-lower`),
      copyQuestion(upperBeadQuiz(id)[0], `${id}-review-upper`),
      copyQuestion(upperBeadQuiz(id)[1], `${id}-review-combined`),
    ]
  }
  if (week === 2) return simultaneousAdditionQuiz(id)
  if (week === 3) return simultaneousSubtractionQuiz(id)

  const first = STRATEGIES[`${week}-1`]
  const second = STRATEGIES[`${week}-2`]
  if (first && second) {
    return [
      copyQuestion(strategyQuiz(`${id}-first`, first)[0], `${id}-review-first`),
      copyQuestion(strategyQuiz(`${id}-second`, second)[0], `${id}-review-second`),
      copyQuestion(strategyQuiz(`${id}-first`, first)[2], `${id}-review-practice`),
    ]
  }
  return simultaneousAdditionQuiz(id)
}

function isStoredQuestion(value: unknown): value is SimaQuizQuestion {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<SimaQuizQuestion>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.question === "string" &&
    Array.isArray(candidate.options) &&
    candidate.options.length >= 2 &&
    candidate.options.every((option) => typeof option === "string") &&
    Number.isInteger(candidate.correctIndex) &&
    (candidate.correctIndex as number) >= 0 &&
    (candidate.correctIndex as number) < candidate.options.length &&
    typeof candidate.explanation === "string"
  )
}

export function getSimaQuizForLesson(lesson: LessonQuizSource): SimaQuizQuestion[] {
  if (Array.isArray(lesson.quiz_questions)) {
    const savedQuestions = lesson.quiz_questions.filter(isStoredQuestion)
    if (savedQuestions.length >= 3) return savedQuestions
  }

  if (lesson.week_number === 1 && lesson.lesson_number === 1) return lowerBeadQuiz(lesson.id)
  if (lesson.week_number === 1 && lesson.lesson_number === 2) return upperBeadQuiz(lesson.id)
  if (lesson.week_number === 2 && lesson.lesson_number < 3) return simultaneousAdditionQuiz(lesson.id)
  if (lesson.week_number === 3 && lesson.lesson_number < 3) return simultaneousSubtractionQuiz(lesson.id)
  if (lesson.lesson_number === 3 && lesson.week_number <= 13) return revisionQuiz(lesson.week_number, lesson.id)
  if (lesson.week_number === 14) {
    return [
      copyQuestion(lowerBeadQuiz(lesson.id)[0], `${lesson.id}-summary-lower`),
      copyQuestion(upperBeadQuiz(lesson.id)[1], `${lesson.id}-summary-upper`),
      copyQuestion(strategyQuiz(lesson.id, { operation: "add", amount: 9, base: 10 })[0], `${lesson.id}-summary-complement`),
    ]
  }

  const strategy = STRATEGIES[`${lesson.week_number}-${lesson.lesson_number}`]
  return strategy ? strategyQuiz(lesson.id, strategy) : simultaneousAdditionQuiz(lesson.id)
}

export function toPublicSimaQuiz(questions: SimaQuizQuestion[]): PublicSimaQuizQuestion[] {
  return questions.map(({ id, question, options }) => ({ id, question, options }))
}

export const COURSES = [
  { id: "sima-abacus", name: "SIMA Abacus", group: "SIMA Abacus", stage: null },
  { id: "math-nursery-2-basic-1", name: "Nursery 2 & Basic 1", group: "Mathematics", stage: "Nursery 2 & Basic 1" },
  { id: "math-basic-2-3", name: "Basic 2-3", group: "Mathematics", stage: "Basic 2-3" },
  { id: "math-upper-basic", name: "Upper Basic", group: "Mathematics", stage: "Upper Basic" },
  { id: "math-junior-secondary", name: "Junior Secondary", group: "Mathematics", stage: "Junior Secondary" },
  { id: "math-senior-secondary", name: "Senior Secondary", group: "Mathematics", stage: "Senior Secondary" },
  { id: "english-grade-1", name: "Grade 1 English", group: "English", stage: "Grade 1 English" },
  { id: "english-grade-2", name: "Grade 2 English", group: "English", stage: "Grade 2 English" },
] as const

export type CourseId = (typeof COURSES)[number]["id"]
/** Courses made of recorded weekly lessons (Mathematics stages and English). */
export type LessonCourseId = Exclude<CourseId, "sima-abacus">
export type MathCourseId = Extract<(typeof COURSES)[number], { group: "Mathematics" }>["id"]

export const MATH_COURSE_IDS: MathCourseId[] = [
  "math-nursery-2-basic-1",
  "math-basic-2-3",
  "math-upper-basic",
  "math-junior-secondary",
  "math-senior-secondary",
]

export const ENGLISH_COURSE_IDS: LessonCourseId[] = ["english-grade-1", "english-grade-2"]

export function isCourseId(value: unknown): value is CourseId {
  return typeof value === "string" && COURSES.some((course) => course.id === value)
}

export function getCourse(id: CourseId) {
  return COURSES.find((course) => course.id === id)!
}

export function stageForMathCourse(id: LessonCourseId) {
  return getCourse(id).stage as string
}

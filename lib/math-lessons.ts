import "server-only"
import { createServiceClient } from "@/lib/supabase/server"
import type { SimaQuizQuestion } from "@/lib/sima/quiz"
import type { SimaCourseLesson, SimaCourseProgress } from "@/components/sima/course-dashboard"

export type MathCourseLesson = SimaCourseLesson & { stage: string }
export type MathLiveClassLink = { stage: string; joinUrl: string; scheduleInfo: string }
export type MathLessonRow = Omit<MathCourseLesson, "unlocked"> & {
  video_id: string
  quiz_questions: unknown
  is_published: boolean
}

export async function getMathCourse({ userId, isAdmin, stages }: { userId: string; isAdmin: boolean; stages: string[] }) {
  if (!stages.length) return { lessons: [] as MathCourseLesson[], progress: [] as SimaCourseProgress[] }
  const service = createServiceClient()
  let query = service.from("math_course_lessons").select("id, stage, week_number, lesson_number, title, summary, release_at, xp_reward").in("stage", stages)
  if (!isAdmin) query = query.eq("is_published", true)
  const [lessonResult, progressResult] = await Promise.all([
    query.order("stage").order("position"),
    service.from("math_course_progress").select("lesson_id, best_score, xp_awarded, attempts, completed_at").eq("user_id", userId),
  ])
  if (lessonResult.error || progressResult.error) throw new Error("Unable to load Mathematics course progress.")
  const lessons = (lessonResult.data ?? []).map((lesson) => ({ ...lesson, unlocked: Date.parse(lesson.release_at) <= Date.now() })) as MathCourseLesson[]
  const lessonIds = new Set(lessons.map((lesson) => lesson.id))
  return { lessons, progress: (progressResult.data ?? []).filter((item) => lessonIds.has(item.lesson_id)) as SimaCourseProgress[] }
}

export async function getMathLiveClassLinks(stages: string[]): Promise<MathLiveClassLink[]> {
  if (!stages.length) return []
  const { data, error } = await createServiceClient()
    .from("math_live_class_links")
    .select("cohort_key, join_url, schedule_info")
    .in("cohort_key", stages)
  if (error) throw new Error("Unable to load weekly Mathematics live-class links.")
  return (data ?? []).map((link) => ({
    stage: link.cohort_key,
    joinUrl: link.join_url,
    scheduleInfo: link.schedule_info,
  }))
}

export async function getMathLesson(lessonId: string): Promise<MathLessonRow | null> {
  const { data, error } = await createServiceClient().from("math_course_lessons")
    .select("id, stage, week_number, lesson_number, title, summary, video_id, release_at, xp_reward, quiz_questions, is_published")
    .eq("id", lessonId).maybeSingle()
  if (error) throw new Error("Unable to load this Mathematics lesson.")
  return data as MathLessonRow | null
}

export async function getSavedLearningProgress(userId: string) {
  const service = createServiceClient()
  const [math, abacus] = await Promise.all([
    service.from("math_course_progress").select("lesson_id, best_score, xp_awarded, attempts, completed_at").eq("user_id", userId),
    service.from("sima_abacus_progress").select("lesson_id, best_score, xp_awarded, attempts, completed_at").eq("user_id", userId),
  ])
  if (math.error || abacus.error) throw new Error("Unable to load your saved lesson progress.")
  return {
    math: (math.data ?? []) as SimaCourseProgress[],
    abacus: (abacus.data ?? []) as SimaCourseProgress[],
    xp: [...(math.data ?? []), ...(abacus.data ?? [])].reduce((sum, item) => sum + item.xp_awarded, 0),
  }
}

export function readMathQuiz(value: unknown): SimaQuizQuestion[] {
  if (!Array.isArray(value) || value.length !== 3 || !value.every((question) =>
    question && typeof question === "object" && typeof question.id === "string" &&
    typeof question.question === "string" && typeof question.explanation === "string" &&
    Array.isArray(question.options) && question.options.length >= 2 && question.options.every((option: unknown) => typeof option === "string") &&
    Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < question.options.length
  )) throw new Error("This Mathematics quiz is not configured correctly.")
  return value as SimaQuizQuestion[]
}

import { CourseSchedule } from "@/components/learn/course-schedule"

export type SimaCourseLesson = {
  id: string
  week_number: number
  lesson_number: number
  title: string
  summary: string
  release_at: string
  xp_reward: number
  unlocked: boolean
}

export type SimaCourseProgress = {
  lesson_id: string
  best_score: number
  xp_awarded: number
  attempts: number
  completed_at: string | null
}

export function SimaCourseDashboard({ lessons, progress }: { lessons: SimaCourseLesson[]; progress: SimaCourseProgress[] }) {
  return <CourseSchedule lessons={lessons} progress={progress} title="SIMA Abacus · Basic 1" course="abacus" />
}

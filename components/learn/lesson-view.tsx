import { SimaLessonView } from "@/components/sima/sima-lesson-view"
import type { MathLessonRow } from "@/lib/math-lessons"
import type { PublicSimaQuizQuestion } from "@/lib/sima/quiz"
import type { SimaCourseProgress } from "@/components/sima/course-dashboard"

export function LessonView({ lesson, questions, progress }: { lesson: MathLessonRow; questions: PublicSimaQuizQuestion[]; progress?: SimaCourseProgress }) {
  return <SimaLessonView lesson={{ ...lesson, video_url: `https://www.youtube.com/watch?v=${lesson.video_id}` }} questions={questions} course="math" progress={progress} />
}

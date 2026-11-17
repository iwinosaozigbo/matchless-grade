import { NextResponse, type NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { getSimaMember } from "@/lib/sima/server"
import { isSimaAdminEmail } from "@/lib/sima/admin"
import { getUnlockedMathStages } from "@/lib/course-access"
import { getMathLesson, readMathQuiz } from "@/lib/math-lessons"

export async function POST(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const fetchSite = request.headers.get("sec-fetch-site")
  const origin = request.headers.get("origin")
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() ?? request.headers.get("host")
  let invalidOrigin = Boolean(fetchSite && fetchSite !== "same-origin")
  try { if (origin && new URL(origin).host !== host) invalidOrigin = true } catch { invalidOrigin = true }
  if (invalidOrigin) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })

  const user = await getSimaMember()
  if (!user) return NextResponse.json({ error: "Sign in to submit this quiz." }, { status: 401 })
  const { lessonId } = await params
  if (lessonId.length > 100 || !/^[A-Za-z0-9_-]+$/.test(lessonId)) return NextResponse.json({ error: "Lesson not found." }, { status: 404 })

  let body: { answers?: unknown }
  try {
    const text = await request.text()
    if (text.length > 2048) return NextResponse.json({ error: "Quiz submission is too large." }, { status: 413 })
    body = JSON.parse(text)
    if (!body || typeof body !== "object") throw new Error("Invalid body")
  } catch { return NextResponse.json({ error: "Invalid quiz submission." }, { status: 400 }) }

  const lesson = await getMathLesson(lessonId)
  const isAdmin = isSimaAdminEmail(user.email)
  if (!lesson || (!isAdmin && (!lesson.is_published || Date.parse(lesson.release_at) > Date.now()))) {
    return NextResponse.json({ error: "This lesson is not available yet." }, { status: 404 })
  }
  const stages = await getUnlockedMathStages(user.email)
  const subjectLabel = lesson.stage.endsWith("English") ? "English" : "Mathematics"
  if (!stages.includes(lesson.stage)) return NextResponse.json({ error: `This ${subjectLabel} level is not assigned to your account.` }, { status: 403 })

  const questions = readMathQuiz(lesson.quiz_questions)
  const answers = body.answers
  if (!Array.isArray(answers) || answers.length !== questions.length || !answers.every((answer, index) => Number.isInteger(answer) && answer >= 0 && answer < questions[index].options.length)) {
    return NextResponse.json({ error: "Choose one answer for every question." }, { status: 400 })
  }
  const correct = questions.reduce((sum, question, index) => sum + Number(answers[index] === question.correctIndex), 0)
  const score = Math.round(correct / questions.length * 100)
  const service = createServiceClient()
  const { data, error } = await service.rpc("record_math_course_quiz", { p_user_id: user.id, p_lesson_id: lesson.id, p_score: score })
  if (error) return NextResponse.json({ error: "Unable to save quiz progress. Please try again." }, { status: 500 })
  const saved = Array.isArray(data) ? data[0] : data
  const { data: progress, error: totalError } = await service.from("math_course_progress").select("xp_awarded").eq("user_id", user.id)
  if (totalError) return NextResponse.json({ error: "Your score was saved, but your XP total could not be loaded. Refresh the page." }, { status: 500 })

  return NextResponse.json({
    correct, total: questions.length, score, passed: score >= 67,
    xpEarned: saved?.xp_earned ?? 0,
    xpTotal: (progress ?? []).reduce((sum, item) => sum + item.xp_awarded, 0),
    bestScore: saved?.best_score ?? score,
    review: questions.map((question, index) => ({ correctIndex: question.correctIndex, explanation: question.explanation, isCorrect: answers[index] === question.correctIndex })),
  }, { headers: { "Cache-Control": "private, no-store" } })
}

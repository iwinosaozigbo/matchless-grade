import { NextResponse, type NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { getSimaMember, getSimaPurchase } from "@/lib/sima/server"
import { isSimaAdminEmail } from "@/lib/sima/admin"
import { getSimaQuizForLesson } from "@/lib/sima/quiz"

function hasSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite) return fetchSite === "same-origin"

  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    const originHost = new URL(origin).host
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim()
    const requestHost = request.headers.get("host")
    return originHost === forwardedHost || originHost === requestHost
  } catch {
    return false
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > 2_048) {
    return NextResponse.json({ error: "Quiz submission is too large." }, { status: 413 })
  }

  const user = await getSimaMember()
  if (!user) return NextResponse.json({ error: "Sign in to submit this quiz." }, { status: 401 })
  const purchase = await getSimaPurchase(user)
  if (!purchase) return NextResponse.json({ error: "A verified SIMA purchase is required." }, { status: 403 })

  const { lessonId } = await params
  if (!/^basic1-(?:w\d{2}-l\d{2}|summary)$/.test(lessonId)) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  }

  let body: { answers?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid quiz submission." }, { status: 400 })
  }

  const isAdmin = isSimaAdminEmail(user.email)
  const serviceClient = createServiceClient()
  let lessonQuery = serviceClient
    .from("sima_abacus_lessons")
    .select("id, week_number, lesson_number, quiz_questions, xp_reward, release_at, is_published")
    .eq("id", lessonId)
  if (!isAdmin) lessonQuery = lessonQuery.eq("is_published", true)
  const { data: lesson, error: lessonError } = await lessonQuery.maybeSingle()

  if (lessonError) return NextResponse.json({ error: "Unable to load the lesson quiz." }, { status: 500 })
  if (!lesson || (!isAdmin && Date.parse(lesson.release_at) > Date.now())) {
    return NextResponse.json({ error: "This lesson is not available yet." }, { status: 404 })
  }

  const questions = getSimaQuizForLesson(lesson)
  const answers = body.answers
  if (
    !Array.isArray(answers) ||
    answers.length !== questions.length ||
    !answers.every((answer, index) => Number.isInteger(answer) && answer >= 0 && answer < questions[index].options.length)
  ) {
    return NextResponse.json({ error: "Choose one answer for every question." }, { status: 400 })
  }

  const correct = questions.reduce((count, question, index) => count + (answers[index] === question.correctIndex ? 1 : 0), 0)
  const score = Math.round((correct / questions.length) * 100)
  const passed = score >= 67

  const { data: previousProgress, error: previousError } = await serviceClient
    .from("sima_abacus_progress")
    .select("xp_awarded")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle()

  if (previousError) return NextResponse.json({ error: "Unable to save quiz progress." }, { status: 500 })

  const { data: savedRows, error: saveError } = await serviceClient.rpc("record_sima_abacus_quiz", {
    p_user_id: user.id,
    p_lesson_id: lessonId,
    p_score: score,
    p_xp_award: lesson.xp_reward,
  })

  if (saveError) return NextResponse.json({ error: "Unable to save quiz progress." }, { status: 500 })
  const saved = Array.isArray(savedRows) ? savedRows[0] : savedRows
  const previousXp = previousProgress?.xp_awarded ?? 0

  const { data: allProgress, error: totalError } = await serviceClient
    .from("sima_abacus_progress")
    .select("xp_awarded")
    .eq("user_id", user.id)

  if (totalError) return NextResponse.json({ error: "Unable to load your XP total." }, { status: 500 })
  const xpTotal = (allProgress ?? []).reduce((sum, item) => sum + item.xp_awarded, 0)

  return NextResponse.json({
    correct,
    total: questions.length,
    score,
    passed,
    xpEarned: Math.max(0, (saved?.xp_awarded ?? previousXp) - previousXp),
    xpTotal,
    bestScore: saved?.best_score ?? score,
    review: questions.map((question, index) => ({
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      isCorrect: answers[index] === question.correctIndex,
    })),
  })
}

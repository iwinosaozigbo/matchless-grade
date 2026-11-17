import { redirect } from "next/navigation"

export default async function RetiredSimaLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  redirect(`/learn/abacus/${encodeURIComponent(lessonId)}`)
}

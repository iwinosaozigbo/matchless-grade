import fs from "node:fs"
import path from "node:path"
import Module, { createRequire } from "node:module"
import ts from "typescript"
import { createClient } from "@supabase/supabase-js"

const require = createRequire(import.meta.url)
const root = process.cwd()
const cache = new Map()
function loadSource(relativePath) {
  const filename = path.resolve(root, relativePath)
  if (cache.has(filename)) return cache.get(filename).exports
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const source = new Module(filename)
  cache.set(filename, source)
  source.require = (specifier) => specifier.startsWith("@/")
    ? loadSource(`${specifier.slice(2)}.ts`) : require(specifier)
  source._compile(compiled, filename)
  return source.exports
}

const { getAllCourseLevels } = loadSource("lib/math-playlists.ts")
const { getMathQuiz } = loadSource("lib/math-quiz.ts")
const levels = await getAllCourseLevels()
if (process.argv.includes("--catalog")) {
  console.log(JSON.stringify(levels.map((level) => ({ stage: level.stage, videos: level.playlist?.videos ?? level.videos ?? [] }))))
  process.exit(0)
}
const start = Date.parse("2026-10-06T23:00:00Z")
const openingVideos = ["E7X2EUVOgDc", "zqMw-GumMRk"]
const stage = process.argv.find((argument) => argument.startsWith("--stage="))?.slice(8)
const lessons = levels.filter((level) => !stage || level.stage === stage).flatMap((level) => {
  const videos = level.playlist?.videos ?? level.videos ?? []
  return videos.map((video, index) => {
    const slug = video.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
    const id = `${slug}-${video.id}`
    const openingIndex = level.stage === "Upper Basic" ? openingVideos.indexOf(video.id) : -1
    const earlierOpeningCount = level.stage === "Upper Basic"
      ? videos.slice(0, index).filter((item) => openingVideos.includes(item.id)).length
      : 0
    const weeklyIndex = index - earlierOpeningCount
    const weekNumber = openingIndex >= 0 ? 1 : level.stage === "Upper Basic"
      ? Math.floor(weeklyIndex / 2) + 2
      : Math.floor(index / 2) + 1
    const lessonNumber = openingIndex >= 0 ? openingIndex + 1 : level.stage === "Upper Basic"
      ? weeklyIndex % 2 + 1
      : index % 2 + 1
    return {
      id, stage: level.stage, position: index + 1,
      week_number: weekNumber, lesson_number: lessonNumber,
    title: video.title, summary: `${level.stage} recorded ${level.subject === "english" ? "English" : "Mathematics"} class. Watch the video and answer three topic practice questions.`,
    video_id: video.id, release_at: new Date(start + (weekNumber - 1) * 7 * 86400000).toISOString(),
    quiz_questions: getMathQuiz(video.title, id), xp_reward: 100, is_published: true,
    }
  })
})

if (process.argv.includes("--sql")) {
  const templates = []
  const rows = lessons.map(({ quiz_questions, ...lesson }) => {
    const questions = quiz_questions.map(({ id, ...question }) => question)
    let template = templates.findIndex((item) => JSON.stringify(item) === JSON.stringify(questions))
    if (template < 0) { template = templates.length; templates.push(questions) }
    return { ...lesson, template }
  })
  const quote = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`
  console.log(`with catalog as (select * from jsonb_to_recordset(${quote(rows)}) as l(id text,stage text,position integer,week_number integer,lesson_number integer,title text,summary text,video_id text,release_at timestamptz,xp_reward integer,is_published boolean,template integer)), templates as (select value, ordinality-1 as template from jsonb_array_elements(${quote(templates)}) with ordinality) insert into public.math_course_lessons(id,stage,position,week_number,lesson_number,title,summary,video_id,release_at,xp_reward,is_published,quiz_questions) select l.id,l.stage,l.position,l.week_number,l.lesson_number,l.title,l.summary,l.video_id,l.release_at,l.xp_reward,l.is_published,(select jsonb_agg(q.value || jsonb_build_object('id',l.id || '-q' || q.ordinality) order by q.ordinality) from jsonb_array_elements(t.value) with ordinality q) from catalog l join templates t on t.template=l.template on conflict(id) do nothing;`)
} else {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await client.from("math_course_lessons").upsert(lessons, { onConflict: "id", ignoreDuplicates: true })
  if (error) throw new Error(`Mathematics import failed: ${error.message}`)
  console.log(JSON.stringify(levels.map((level) => ({ stage: level.stage, videos: lessons.filter((lesson) => lesson.stage === level.stage).length }))))
}

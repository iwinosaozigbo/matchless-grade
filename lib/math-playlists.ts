import { ENGLISH_LEVELS, MATH_LEVELS, type MathLevel } from "@/lib/math-curriculum"

type PlaylistVideo = { id: string; title: string }

const REVALIDATE_SECONDS = 600

function collectVideos(node: unknown, out: PlaylistVideo[], seen: Set<string>) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    for (const child of node) collectVideos(child, out, seen)
    return
  }
  const record = node as Record<string, unknown>

  const lockup = record.lockupViewModel as
    | { contentId?: string; contentType?: string; metadata?: { lockupMetadataViewModel?: { title?: { content?: string } } } }
    | undefined
  if (lockup?.contentId && lockup.contentType === "LOCKUP_CONTENT_TYPE_VIDEO") {
    const title = lockup.metadata?.lockupMetadataViewModel?.title?.content
    if (title && !seen.has(lockup.contentId)) {
      seen.add(lockup.contentId)
      out.push({ id: lockup.contentId, title })
    }
  }

  const legacy = record.playlistVideoRenderer as
    | { videoId?: string; title?: { runs?: { text?: string }[]; simpleText?: string } }
    | undefined
  if (legacy?.videoId) {
    const title = legacy.title?.runs?.[0]?.text ?? legacy.title?.simpleText
    if (title && !seen.has(legacy.videoId)) {
      seen.add(legacy.videoId)
      out.push({ id: legacy.videoId, title })
    }
  }

  for (const value of Object.values(record)) collectVideos(value, out, seen)
}

async function fetchPlaylistVideos(listId: string): Promise<PlaylistVideo[] | null> {
  try {
    const res = await fetch(`https://www.youtube.com/playlist?list=${encodeURIComponent(listId)}&hl=en`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/)
    if (!match) return null
    const videos: PlaylistVideo[] = []
    collectVideos(JSON.parse(match[1]), videos, new Set())
    return videos.length > 0 ? videos : null
  } catch (error) {
    console.error("[math-playlists] Failed to load playlist", listId, error)
    return null
  }
}

const LESSON_NUMBER = /lesson\s*(\d+)/i

function lessonNumber(title: string) {
  const match = title.match(LESSON_NUMBER)
  return match ? Number(match[1]) : null
}

/** Playlists are not always in teaching order, so numbered "Lesson N" titles are sorted ascending. */
function orderVideos(videos: PlaylistVideo[]) {
  if (!videos.every((video) => lessonNumber(video.title) !== null)) return videos
  return [...videos].sort((a, b) => lessonNumber(a.title)! - lessonNumber(b.title)!)
}

async function resolveLevels(levels: MathLevel[]): Promise<MathLevel[]> {
  return Promise.all(
    levels.map(async (level) => {
      if (!level.playlist) return level
      const listId = new URL(level.playlist.href).searchParams.get("list")
      const live = listId ? await fetchPlaylistVideos(listId) : null
      if (!live) return { ...level, playlist: { ...level.playlist, videos: orderVideos(level.playlist.videos) } }
      const liveIds = new Set(live.map((v) => v.id))
      const savedExtras = level.playlist.videos.filter((v) => !liveIds.has(v.id))
      return { ...level, playlist: { ...level.playlist, videos: orderVideos([...live, ...savedExtras]) } }
    }),
  )
}

/**
 * Mathematics stages with playlist videos pulled live from YouTube (cached for 10 minutes).
 * Falls back to the saved list in `MATH_LEVELS` if YouTube can't be reached.
 */
export async function getMathLevels(): Promise<MathLevel[]> {
  return resolveLevels(MATH_LEVELS)
}

/** Every recorded-lesson stage (Mathematics and English) for the admin library and the lesson import. */
export async function getAllCourseLevels(): Promise<MathLevel[]> {
  return resolveLevels([...MATH_LEVELS, ...ENGLISH_LEVELS])
}

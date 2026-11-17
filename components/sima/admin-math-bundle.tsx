import { ExternalLink, PlayCircle } from "lucide-react"
import type { MathLevel } from "@/lib/math-curriculum"

export function MathBundleTab({ levels }: { levels: MathLevel[] }) {
  const MATH_LEVELS = levels
  const totalVideos = MATH_LEVELS.reduce((sum, level) => sum + (level.playlist?.videos.length ?? level.videos?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.07] bg-[#121822] p-5">
        <h2 className="text-sm font-semibold text-white">Mathematics &amp; English courses</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {MATH_LEVELS.length} stages · {totalVideos} recorded video{totalVideos === 1 ? "" : "s"} from Matchless Grade lessons.
        </p>
      </section>

      {MATH_LEVELS.map((level) => {
        const videos = level.playlist?.videos ?? level.videos ?? []
        return (
          <section key={level.id} className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121822]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  {level.stage}
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {level.subject === "english" ? "English" : "Mathematics"}
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {level.grades} · {videos.length} video{videos.length === 1 ? "" : "s"}
                </p>
              </div>
              {level.playlist && (
                <a
                  href={level.playlist.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200"
                >
                  Open playlist
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            {videos.length > 0 ? (
              <ul className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                {videos.map((video, index) => (
                  <li key={`${video.id}-${video.title}-${index}`}>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-white/[0.07] transition-colors hover:border-violet-300/30"
                    >
                      <div className="relative aspect-video bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                          alt=""
                          className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                        />
                        <PlayCircle className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white/90" aria-hidden="true" />
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-[11px] text-slate-500">Video {index + 1}</p>
                        <p className="text-sm font-medium text-white">{video.title}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-xs text-slate-500">
                {level.freeClass ? (
                  <>
                    No playlist yet. Free class:{" "}
                    <a href={level.freeClass.href} target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:text-violet-200">
                      {level.freeClass.label.replace(/^Watch a free class:\s*/, "")}
                    </a>
                  </>
                ) : (
                  "No playlist videos yet."
                )}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}

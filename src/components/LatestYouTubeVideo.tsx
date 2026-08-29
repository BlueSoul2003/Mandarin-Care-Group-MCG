"use client"

import { useEffect, useState } from "react"
import { Play, ExternalLink, Calendar, Sparkles, Video } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

interface VideoData {
  videoId?: string
  title?: string
  description?: string
  thumbnail?: string
  publishedAt?: string
  channelTitle?: string
  channelHandle?: string
  channelUrl?: string
  error?: string
}

export function LatestYouTubeVideo() {
  const t = useTranslations("Home")
  const [video, setVideo] = useState<VideoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchLatestVideo() {
      try {
        const res = await fetch("/api/youtube/latest")
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setVideo(data)
          }
        }
      } catch (err) {
        console.error("Failed to load latest YouTube video:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    fetchLatestVideo()
    return () => {
      isMounted = false
    }
  }, [])

  const channelUrl = video?.channelUrl || "https://www.youtube.com/@mcgutm5385"

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto my-12 p-6 rounded-3xl border border-border/60 bg-card/60 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded-full mb-6" />
        <div className="aspect-video w-full bg-muted/70 rounded-2xl" />
      </div>
    )
  }

  // If a specific videoId is retrieved
  if (video?.videoId) {
    const formattedDate = video.publishedAt
      ? new Date(video.publishedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : ""

    return (
      <section className="w-full max-w-5xl mx-auto my-16 text-left">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-sm shrink-0">
              <YouTubeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">
                  {t("youtubeLatestTitle")}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">
                  <Sparkles className="w-3 h-3" />
                  New
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {video.channelHandle || "@mcgutm5385"} • {t("youtubeLatestSubtitle")}
              </p>
            </div>
          </div>

          {/* Visit Channel Button */}
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold self-start sm:self-auto shadow-sm"
          >
            <YouTubeIcon className="w-3.5 h-3.5" />
            <span>{t("youtubeVisitChannel")}</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        </div>

        {/* Video Card Container */}
        <div className="relative rounded-3xl border border-border/70 bg-card overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl transition-shadow duration-300">
          <div className="relative aspect-video w-full bg-black/90">
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.iframe
                  key="iframe"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
                  title={video.title || "YouTube video player"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <motion.div
                  key="thumbnail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full group cursor-pointer overflow-hidden"
                  onClick={() => setIsPlaying(true)}
                >
                  {/* Thumbnail Image */}
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title || "YouTube Thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-400">
                      <YouTubeIcon className="w-16 h-16 opacity-40" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity" />

                  {/* Center Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300 backdrop-blur-sm ring-4 ring-white/20">
                      <Play className="w-7 h-7 md:w-8 md:h-8 fill-current ml-1" />
                    </div>
                  </div>

                  {/* Bottom Text Overlay inside Thumbnail */}
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white">
                    {formattedDate && (
                      <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium mb-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    )}
                    <h3 className="text-lg md:text-2xl font-bold font-heading text-white line-clamp-2 drop-shadow-md">
                      {video.title}
                    </h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Description & Action Bar */}
          <div className="p-5 md:p-6 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/40">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-foreground truncate">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {video.description}
                </p>
              )}
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-sm"
            >
              <span>{t("youtubeWatchDirect")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    )
  }

  // Fallback Channel Card if no direct video item is loaded
  return (
    <section className="w-full max-w-5xl mx-auto my-16 text-left">
      <div className="p-6 md:p-8 rounded-3xl border border-red-500/20 bg-gradient-to-br from-card via-card to-red-500/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <YouTubeIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-heading text-foreground">
                MCG UTM YouTube Channel
              </h3>
              <span className="text-xs text-muted-foreground font-mono">@mcgutm5385</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
              {t("youtubeChannelDesc")}
            </p>
          </div>
        </div>

        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 shrink-0"
        >
          <YouTubeIcon className="w-4 h-4" />
          <span>{t("youtubeSubscribe")}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>
      </div>
    </section>
  )
}

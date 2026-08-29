"use client"

import * as React from "react"
import { usePlayerStore } from "@/store/usePlayerStore"
import { Play, Pause, X, Music, SkipBack, SkipForward, Heart } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { getSongCategory } from "@/lib/songUtils"

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

export function GlobalAudioPlayer() {
  const t = useTranslations("Taize")
  const {
    isPlaying,
    currentTrack,
    playlist,
    playlistType,
    togglePlay,
    nextTrack,
    prevTrack,
    volume,
    currentTime,
    duration,
    setCurrentTime,
    setDuration,
  } = usePlayerStore()

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const progressBarRef = React.useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Sync state with HTMLAudioElement
  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error("Audio playback failed", e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack])

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // When a track ends, automatically play next song in the active playlist queue
  const handleEnded = () => {
    nextTrack()
  }

  // Seek bar click/drag interaction
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newPercentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = newPercentage * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* Invisible Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-background/90 backdrop-blur-2xl border border-border/70 shadow-2xl rounded-3xl p-4 z-50 overflow-hidden"
          >
            {/* Animated breathing background glow */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 bg-primary/5 z-0"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            <div className="relative z-10 space-y-3">
              {/* Track Info & Close */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <Music className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {currentTrack.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    {playlistType === "favorites" ? (
                      <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                        <Heart className="w-3 h-3 fill-current" />
                        <span>Favorites Queue</span>
                      </span>
                    ) : (
                      <span>{getSongCategory(currentTrack)}</span>
                    )}
                    {playlist.length > 1 && (
                      <span className="opacity-60 text-[10px]">
                        • {playlist.findIndex((t) => t.id === currentTrack.id || t.url === currentTrack.url) + 1}/{playlist.length}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => usePlayerStore.setState({ currentTrack: null, isPlaying: false })}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                  aria-label="Close player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress / Scrubber Bar */}
              <div className="space-y-1">
                <div
                  ref={progressBarRef}
                  onClick={handleSeek}
                  className="relative h-2 bg-muted/80 rounded-full cursor-pointer group transition-all"
                  title="Click to seek"
                >
                  {/* Active fill */}
                  <div
                    className="h-full bg-primary rounded-full transition-all relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    {/* Thumb indicator on hover / drag */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-foreground border-2 border-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Time Display */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono px-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls: Prev, Play/Pause, Next */}
              <div className="flex items-center justify-center gap-3 pt-0.5">
                <button
                  onClick={prevTrack}
                  disabled={playlist.length <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  title="Previous song"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  disabled={playlist.length <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  title="Next song"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

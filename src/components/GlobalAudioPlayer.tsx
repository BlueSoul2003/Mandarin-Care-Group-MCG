"use client"

import * as React from "react"
import { usePlayerStore } from "@/store/usePlayerStore"
import { Play, Pause, X, Music, Volume2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function GlobalAudioPlayer() {
  const { isPlaying, currentTrack, togglePlay, setVolume, volume } = usePlayerStore()
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Sync state with HTMLAudioElement
  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback failed", e))
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

  const handleEnded = () => {
    usePlayerStore.setState({ isPlaying: false })
  }

  return (
    <>
      {/* Invisible Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={handleEnded}
          loop // For Taize, we typically loop the chant
        />
      )}

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 z-50 overflow-hidden"
          >
            {/* Animated breathing background glow */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 bg-primary/5 z-0"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Music className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-muted-foreground">Taizé Prayer</p>
              </div>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shrink-0 shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              <button
                onClick={() => usePlayerStore.setState({ currentTrack: null, isPlaying: false })}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

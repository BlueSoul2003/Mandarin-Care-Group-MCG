"use client"

import { usePlayerStore } from "@/store/usePlayerStore"
import { Play, Pause, Disc3 } from "lucide-react"
import { motion } from "framer-motion"

const TAIZE_TRACKS = [
  {
    id: "1",
    title: "O Lord Hear My Prayer",
    // Public domain/royalty free mock audio for testing
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Bless The Lord My Soul",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
]

export default function TaizePage() {
  const { currentTrack, isPlaying, play, togglePlay } = usePlayerStore()

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl relative">
      {/* Background breathing glow if any taize is playing */}
      {isPlaying && (
        <motion.div
          className="fixed inset-0 pointer-events-none bg-primary/5 z-[-1]"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">Taizé Room</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          在靜默與不斷重複的短頌中，進入內心的寧靜。點擊播放，讓音樂伴隨你在各個頁面中穿梭祈禱。
        </p>
      </div>

      <div className="space-y-6">
        {TAIZE_TRACKS.map((track) => {
          const isThisTrackPlaying = currentTrack?.id === track.id

          return (
            <div
              key={track.id}
              className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                isThisTrackPlaying
                  ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border/50 bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isThisTrackPlaying ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Disc3 className={`w-6 h-6 ${isThisTrackPlaying && isPlaying ? "animate-spin-slow" : ""}`} style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{track.title}</h3>
                  <p className="text-sm text-muted-foreground">Taizé Community</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentTrack?.id === track.id) {
                    togglePlay()
                  } else {
                    play(track)
                  }
                }}
                className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              >
                {isThisTrackPlaying && isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

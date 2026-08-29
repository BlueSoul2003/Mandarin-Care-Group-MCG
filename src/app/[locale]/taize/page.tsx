"use client"

import { useEffect, useState, useMemo } from "react"
import { usePlayerStore } from "@/store/usePlayerStore"
import { useFavoritesStore } from "@/store/useFavoritesStore"
import { Play, Pause, Disc3, Search, Heart, X, Music } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { getSongCategory } from "@/lib/songUtils"

interface AudioTrack {
  id: string
  title: string
  url: string
}

const FALLBACK_TRACKS: AudioTrack[] = [
  { id: "1", title: "01 主爱的家", url: encodeURI("/api/audio/01 主爱的家.mp3") },
  { id: "2", title: "02 天主经活动版", url: encodeURI("/api/audio/02 天主经活动版.mp3") },
  { id: "3", title: "03 主你了解我", url: encodeURI("/api/audio/03 主你了解我.mp3") },
  { id: "4", title: "04 天主的爱", url: encodeURI("/api/audio/04 天主的爱.mp3") },
  { id: "5", title: "05 牵我的手", url: encodeURI("/api/audio/05 牵我的手.mp3") },
  { id: "6", title: "06 可爱主耶稣", url: encodeURI("/api/audio/06 可爱主耶稣.mp3") },
  { id: "7", title: "07 主的呼唤", url: encodeURI("/api/audio/07 主的呼唤.mp3") },
  { id: "8", title: "08 欢呼歌（圣圣圣）", url: encodeURI("/api/audio/08 欢呼歌（圣圣圣）.mp3") },
  { id: "9", title: "09 飞吧", url: encodeURI("/api/audio/09 飞吧.mp3") },
  { id: "10", title: "10 耶稣我爱你", url: encodeURI("/api/audio/10 耶稣我爱你.mp3") },
  { id: "11", title: "11 天主经弥撒版", url: encodeURI("/api/audio/11 天主经弥撒版.mp3") },
  { id: "12", title: "12 小白花", url: encodeURI("/api/audio/12 小白花.mp3") },
  { id: "13", title: "13 奇迹", url: encodeURI("/api/audio/13 奇迹.mp3") },
  { id: "14", title: "14 我今欢喜", url: encodeURI("/api/audio/14 我今欢喜.mp3") },
]

export default function TaizePage() {
  const t = useTranslations("Taize")
  const { currentTrack, isPlaying, play, togglePlay } = usePlayerStore()
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore()

  const [mounted, setMounted] = useState(false)
  const [tracks, setTracks] = useState<AudioTrack[]>(FALLBACK_TRACKS)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all")

  useEffect(() => {
    setMounted(true)
    let isMounted = true
    async function loadTracks() {
      try {
        const res = await fetch("/api/audio")
        if (res.ok) {
          const data = await res.json()
          if (data.tracks && data.tracks.length > 0 && isMounted) {
            setTracks(data.tracks)
          }
        }
      } catch (err) {
        console.error("Failed to load tracks from Filebase:", err)
      }
    }
    loadTracks()
    return () => {
      isMounted = false
    }
  }, [])

  // Filter tracks based on search query and active tab
  const filteredTracks = useMemo(() => {
    let list = tracks

    if (activeTab === "favorites") {
      if (!mounted) return []
      list = tracks.filter((track) => isFavorite(track.url) || isFavorite(track.id) || isFavorite(track.title))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((track) => track.title.toLowerCase().includes(q))
    }

    return list
  }, [tracks, searchQuery, activeTab, favorites, isFavorite, mounted])

  const favoriteCount = useMemo(() => {
    if (!mounted) return 0
    return tracks.filter((track) => isFavorite(track.url) || isFavorite(track.id) || isFavorite(track.title)).length
  }, [tracks, favorites, isFavorite, mounted])

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl relative min-h-[85vh]">
      {/* Background breathing glow if any taize is playing */}
      {isPlaying && (
        <motion.div
          className="fixed inset-0 pointer-events-none bg-primary/5 z-[-1]"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">{t("title")}</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t("desc")}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-card border border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={t("clearSearch")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/40 shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("allSongs")} ({tracks.length})
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "favorites"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  favoriteCount > 0
                    ? "fill-amber-500 text-amber-500 dark:text-amber-400 dark:fill-amber-400"
                    : "text-muted-foreground fill-none"
                }`}
              />
              <span>{t("myFavorites")}</span>
              <span className="text-xs opacity-75">({favoriteCount})</span>
            </button>
          </div>
        </div>

        {/* Search status / count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{t("songsCount", { count: filteredTracks.length })}</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="hover:text-primary transition-colors underline underline-offset-2"
            >
              {t("clearSearch")}
            </button>
          )}
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filteredTracks.map((track) => {
            const isThisTrackPlaying = currentTrack?.id === track.id || currentTrack?.url === track.url
            const favorited = mounted && (isFavorite(track.url) || isFavorite(track.id) || isFavorite(track.title))

            return (
              <motion.div
                key={track.id || track.url}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                  isThisTrackPlaying
                    ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border/50 bg-card hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3.5 md:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isThisTrackPlaying ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Disc3
                      className={`w-5 h-5 md:w-6 md:h-6 ${
                        isThisTrackPlaying && isPlaying ? "animate-spin-slow" : ""
                      }`}
                      style={{ animationDuration: "4s" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-foreground truncate">{track.title}</h3>
                    <p className="text-xs text-muted-foreground">{getSongCategory(track)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Favorite Toggle Button */}
                  <button
                    onClick={() => toggleFavorite(track)}
                    className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${
                      favorited
                        ? "text-amber-500 dark:text-amber-400 hover:bg-amber-500/10"
                        : "text-muted-foreground/50 hover:text-amber-500 hover:bg-muted"
                    }`}
                    title={favorited ? t("unfavorite") : t("favorite")}
                    aria-label={favorited ? t("unfavorite") : t("favorite")}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        favorited
                          ? "scale-110 fill-current text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                          : "fill-none stroke-[2.2]"
                      }`}
                    />
                  </button>

                  {/* Play / Pause Button */}
                  <button
                    onClick={() => {
                      if (currentTrack?.id === track.id || currentTrack?.url === track.url) {
                        togglePlay()
                      } else {
                        play(track, filteredTracks, activeTab)
                      }
                    }}
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                      isThisTrackPlaying && isPlaying
                        ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                        : "bg-foreground text-background hover:scale-105 active:scale-95"
                    }`}
                    title={isThisTrackPlaying && isPlaying ? t("pause") : t("play")}
                    aria-label={isThisTrackPlaying && isPlaying ? t("pause") : t("play")}
                  >
                    {isThisTrackPlaying && isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredTracks.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/70 bg-card/40">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {activeTab === "favorites" ? t("noFavorites") : t("noResults", { query: searchQuery })}
            </h3>
            {activeTab === "favorites" ? (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>{t("allSongs")}</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

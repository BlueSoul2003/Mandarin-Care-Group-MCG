
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Layers,
  HeartHandshake,
  Play,
  Pause,
  FastForward,
  ChevronDown,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import {
  type MysteryType,
  getTodaysMystery,
  getDecadeLabels,
  generateRosarySteps,
  DEFAULT_ROSARY_AUDIO_MAP,
} from "@/lib/rosary-data"
import { usePlayerStore } from "@/store/usePlayerStore"

const STORAGE_KEY = "mcg_rosary_progress"

function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

export function RosaryGuide() {
  const locale = useLocale() as "en" | "zh-TW"
  const t = useTranslations("RosaryGuide")

  const todaysMystery = React.useMemo(() => getTodaysMystery(), [])
  const [selectedMystery, setSelectedMystery] = React.useState<MysteryType>(todaysMystery)
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0)
  const [hailMaryIndex, setHailMaryIndex] = React.useState<number>(1)
  const [direction, setDirection] = React.useState(0) // -1 left, 1 right
  const [isJumpMenuOpen, setIsJumpMenuOpen] = React.useState(false)
  const isLoadedRef = React.useRef(false)

  // Audio Playback State (for English & Chinese narration)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [audioMap, setAudioMap] = React.useState(DEFAULT_ROSARY_AUDIO_MAP)
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false)
  const [playbackSpeed, setPlaybackSpeed] = React.useState<number>(1)
  const [currentTime, setCurrentTime] = React.useState<number>(0)
  const [duration, setDuration] = React.useState<number>(0)
  const [reflectionCountdown, setReflectionCountdown] = React.useState<number | null>(null)
  const reflectionTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const playbackSpeedRef = React.useRef(playbackSpeed)
  playbackSpeedRef.current = playbackSpeed

  // Load dynamically mapped audio files from Filebase
  React.useEffect(() => {
    let isMounted = true
    async function loadRosaryAudio() {
      try {
        const res = await fetch("/api/audio/rosary")
        if (res.ok) {
          const data = await res.json()
          if (data.audioMap && isMounted) {
            setAudioMap((prev) => ({
              en: { ...prev.en, ...(data.audioMap.en || {}) },
              "zh-TW": { ...prev["zh-TW"], ...(data.audioMap["zh-TW"] || {}) },
            }))
          }
        }
      } catch (err) {
        console.error("Failed to load Rosary audio map:", err)
      }
    }
    loadRosaryAudio()
    return () => {
      isMounted = false
    }
  }, [])

  // Restore saved progress from localStorage after initial client mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          if (
            saved?.selectedMystery &&
            ["joyful", "luminous", "sorrowful", "glorious"].includes(saved.selectedMystery)
          ) {
            setSelectedMystery(saved.selectedMystery)
          }
          if (typeof saved?.currentStepIndex === "number" && saved.currentStepIndex >= 0) {
            setCurrentStepIndex(saved.currentStepIndex)
          }
          if (typeof saved?.hailMaryIndex === "number" && saved.hailMaryIndex >= 1) {
            setHailMaryIndex(saved.hailMaryIndex)
          }
        }
      } catch {
        // Ignore storage read errors
      } finally {
        isLoadedRef.current = true
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Persist progress to localStorage on change once loaded
  React.useEffect(() => {
    if (!isLoadedRef.current) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedMystery,
          currentStepIndex,
          hailMaryIndex,
        })
      )
    } catch {
      // Ignore storage write errors
    }
  }, [selectedMystery, currentStepIndex, hailMaryIndex])

  // Generate steps based on selected mystery & locale
  const steps = React.useMemo(() => {
    return generateRosarySteps(selectedMystery, locale === "zh-TW" ? "zh-TW" : "en")
  }, [selectedMystery, locale])

  // Reset index when mystery changes
  const handleSelectMystery = (mystery: MysteryType) => {
    if (mystery !== selectedMystery) {
      setSelectedMystery(mystery)
      setCurrentStepIndex(0)
      setHailMaryIndex(1)
      setDirection(0)
      setIsJumpMenuOpen(false)
    }
  }

  const currentStep = steps[currentStepIndex] || steps[0]

  const paginate = React.useCallback(
    (newDirection: number) => {
      if (newDirection > 0) {
        // Going Next
        if (
          currentStep.prayerType === "hail-mary" &&
          currentStep.totalHailMarys &&
          hailMaryIndex < currentStep.totalHailMarys
        ) {
          setHailMaryIndex((prev) => prev + 1)
          return
        }
        // Advance to next step
        const nextIdx = currentStepIndex + 1
        if (nextIdx < steps.length) {
          setDirection(1)
          setCurrentStepIndex(nextIdx)
          setHailMaryIndex(1)
        }
      } else {
        // Going Previous
        if (
          currentStep.prayerType === "hail-mary" &&
          hailMaryIndex > 1
        ) {
          setHailMaryIndex((prev) => prev - 1)
          return
        }
        // Go back to previous step
        const prevIdx = currentStepIndex - 1
        if (prevIdx >= 0) {
          setDirection(-1)
          setCurrentStepIndex(prevIdx)
          const targetStep = steps[prevIdx]
          if (targetStep.prayerType === "hail-mary" && targetStep.totalHailMarys) {
            setHailMaryIndex(targetStep.totalHailMarys)
          } else {
            setHailMaryIndex(1)
          }
        }
      }
    },
    [currentStep, currentStepIndex, hailMaryIndex, steps]
  )

  // Keyboard navigation (ArrowLeft, ArrowRight, Space)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        paginate(-1)
      } else if (e.key === "ArrowRight" || e.key === "Space") {
        paginate(1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [paginate])

  const jumpToStep = (index: number) => {
    setDirection(index > currentStepIndex ? 1 : -1)
    setCurrentStepIndex(index)
    setHailMaryIndex(1)
    setIsJumpMenuOpen(false)
  }

  const jumpToDecade = (decadeIndex: number) => {
    const target = steps.findIndex((s) => s.decadeIndex === decadeIndex)
    if (target !== -1) {
      jumpToStep(target)
    }
  }

  const mysteryTypes: Array<{ type: MysteryType; label: string; daysEn: string; daysZh: string }> = [
    { type: "joyful", label: t("joyful"), daysEn: "Mon & Sat", daysZh: "週一、六" },
    { type: "luminous", label: t("luminous"), daysEn: "Thu", daysZh: "週四" },
    { type: "sorrowful", label: t("sorrowful"), daysEn: "Tue & Fri", daysZh: "週二、五" },
    { type: "glorious", label: t("glorious"), daysEn: "Wed & Sun", daysZh: "週三、日" },
  ]

  const decadePillLabels = React.useMemo(
    () => getDecadeLabels(selectedMystery, locale === "zh-TW" ? "zh-TW" : "en"),
    [selectedMystery, locale]
  )

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 240 : -240,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 240 : -240,
      opacity: 0,
      scale: 0.98,
    }),
  }

  const isLastStep =
    currentStepIndex === steps.length - 1 &&
    (!currentStep.totalHailMarys || hailMaryIndex === currentStep.totalHailMarys)

  // Play current prayer audio
  const playPrayerAudio = React.useCallback(
    (step: (typeof steps)[number]) => {
      if (step.prayerType === "mystery") {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        setReflectionCountdown(4)
        if (reflectionTimerRef.current) clearInterval(reflectionTimerRef.current)
        reflectionTimerRef.current = setInterval(() => {
          setReflectionCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(reflectionTimerRef.current!)
              reflectionTimerRef.current = null
              paginate(1)
              return null
            }
            return prev - 1
          })
        }, 1000)
        return
      }

      if (reflectionTimerRef.current) {
        clearInterval(reflectionTimerRef.current)
        reflectionTimerRef.current = null
      }
      setReflectionCountdown(null)

      const activeLocale = locale === "zh-TW" ? "zh-TW" : "en"
      const url = audioMap[activeLocale]?.[step.prayerType] || audioMap.en?.[step.prayerType]
      if (url && audioRef.current) {
        usePlayerStore.setState({ isPlaying: false }) // Pause global music
        audioRef.current.src = url
        audioRef.current.playbackRate = playbackSpeedRef.current
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
          console.log("Audio play prevented or interrupted:", err)
        })
      }
    },
    [audioMap, paginate, locale]
  )

  // Trigger audio update when step index or mystery changes while playing
  React.useEffect(() => {
    if (!isAudioPlaying) return
    const step = steps[currentStepIndex]
    if (step) {
      playPrayerAudio(step)
    }
  }, [currentStepIndex, selectedMystery, isAudioPlaying, playPrayerAudio, steps])

  // Handle audio track finishing
  const handleAudioEnded = React.useCallback(() => {
    if (!isAudioPlaying) return

    if (currentStep.prayerType === "hail-mary") {
      const maxBeads = currentStep.totalHailMarys || 1
      if (hailMaryIndex < maxBeads) {
        setHailMaryIndex((prev) => prev + 1)
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.playbackRate = playbackSpeedRef.current
          audioRef.current.play().catch(console.error)
        }
        return
      }
    }

    if (isLastStep) {
      setIsAudioPlaying(false)
      return
    }

    paginate(1)
  }, [isAudioPlaying, currentStep, hailMaryIndex, isLastStep, paginate])

  // Toggle Audio Play / Pause
  const toggleAudioPlay = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (reflectionTimerRef.current) {
        clearInterval(reflectionTimerRef.current)
        reflectionTimerRef.current = null
      }
      setReflectionCountdown(null)
    } else {
      setIsAudioPlaying(true)
      playPrayerAudio(currentStep)
    }
  }

  // Change Playback Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }

  // Skip mystery meditation
  const skipReflection = () => {
    if (reflectionTimerRef.current) {
      clearInterval(reflectionTimerRef.current)
      reflectionTimerRef.current = null
    }
    setReflectionCountdown(null)
    paginate(1)
  }

  // Handle manual bead clicking
  const handleSelectBead = (beadNumber: number) => {
    setHailMaryIndex(beadNumber)
    if (isAudioPlaying && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    }
  }

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (reflectionTimerRef.current) {
        clearInterval(reflectionTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      {/* 1. Mystery Selection Tabs */}
      <div className="w-full bg-card/80 backdrop-blur-md rounded-2xl border border-border/60 p-2 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {mysteryTypes.map((item) => {
            const isSelected = selectedMystery === item.type
            const isToday = todaysMystery === item.type
            return (
              <button
                key={item.type}
                onClick={() => handleSelectMystery(item.type)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {isToday && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {t("today")}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-normal ${
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground/70"
                  }`}
                >
                  {locale === "zh-TW" ? item.daysZh : item.daysEn}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Decade Navigation & Bead Indicator */}
      <div className="w-full bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col gap-3">
        {/* Section / Decade Jump Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
          {decadePillLabels.map((label, dIdx) => {
            const isActiveDecade = currentStep.decadeIndex === dIdx
            const isPastDecade = currentStep.decadeIndex > dIdx
            return (
              <button
                key={dIdx}
                onClick={() => jumpToDecade(dIdx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                  isActiveDecade
                    ? "bg-primary text-primary-foreground shadow-xs font-bold scale-105"
                    : isPastDecade
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* 10-Bead Progress Indicator for Hail Marys */}
        {currentStep.prayerType === "hail-mary" && currentStep.totalHailMarys === 10 && (
          <div className="pt-2 border-t border-border/40 flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground px-1">
              <span className="font-semibold text-primary">
                {locale === "zh-TW"
                  ? `聖母經（第 ${hailMaryIndex} 遍 / 共 10 遍）`
                  : `Hail Mary (${hailMaryIndex} of 10)`}
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {hailMaryIndex} / 10
              </span>
            </div>

            <div className="flex items-center justify-between w-full gap-1.5 sm:gap-2 px-1">
              {Array.from({ length: 10 }).map((_, i) => {
                const beadNumber = i + 1
                const isCurrent = hailMaryIndex === beadNumber
                const isPassed = hailMaryIndex > beadNumber

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectBead(beadNumber)}
                    className={`relative flex-1 h-3.5 sm:h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isCurrent
                        ? "bg-primary shadow-md shadow-primary/40 ring-2 ring-primary/50 scale-110"
                        : isPassed
                        ? "bg-primary/45 hover:bg-primary/60"
                        : "bg-muted/80 dark:bg-muted/50 hover:bg-muted"
                    }`}
                    title={`${beadNumber} / 10`}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* 3-Bead Indicator for Introductory Hail Marys */}
        {currentStep.prayerType === "hail-mary" && currentStep.totalHailMarys === 3 && (
          <div className="pt-2 border-t border-border/40 flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground px-1">
              <span className="font-semibold text-primary">
                {locale === "zh-TW"
                  ? `聖母經（第 ${hailMaryIndex} 遍 / 共 3 遍）`
                  : `Hail Mary (${hailMaryIndex} of 3)`}
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {hailMaryIndex} / 3
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 w-full px-1">
              {Array.from({ length: 3 }).map((_, i) => {
                const beadNumber = i + 1
                const isCurrent = hailMaryIndex === beadNumber
                const isPassed = hailMaryIndex > beadNumber

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectBead(beadNumber)}
                    className={`w-12 h-3.5 sm:h-4 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "bg-primary shadow-md shadow-primary/40 ring-2 ring-primary/50 scale-110"
                        : isPassed
                        ? "bg-primary/45 hover:bg-primary/60"
                        : "bg-muted/80 dark:bg-muted/50 hover:bg-muted"
                    }`}
                    title={`${beadNumber} / 3`}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Prayer Interactive Card */}
      <div className="relative w-full bg-card rounded-3xl shadow-xl border border-border/60 overflow-hidden flex flex-col min-h-[460px] md:min-h-[480px]">
        {/* Card Header with Location Badge & Quick Menu */}
        <div className="pt-6 px-6 sm:px-8 pb-3 border-b border-border/40 flex items-center justify-between gap-2 bg-muted/20">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {currentStep.sectionTitle}
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {currentStep.prayerType === "hail-mary" && currentStep.totalHailMarys
                ? `${currentStep.title} (${hailMaryIndex}/${currentStep.totalHailMarys})`
                : currentStep.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsJumpMenuOpen(!isJumpMenuOpen)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 border border-border/40"
              title={t("jumpToSection")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("jumpToSection")}</span>
            </button>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              {currentStepIndex + 1}/{steps.length}
            </span>
          </div>
        </div>

        {/* Quick Jump Dropdown Drawer */}
        <AnimatePresence>
          {isJumpMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border/60 bg-muted/95 backdrop-blur-md"
            >
              <div className="p-4 max-h-60 overflow-y-auto space-y-1 text-xs">
                <p className="font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("jumpToSection")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {steps
                    .filter(
                      (s) =>
                        s.prayerType === "mystery" ||
                        (s.decadeIndex === 0 && s.id === 0) ||
                        (s.decadeIndex === 6 && s.prayerType === "hail-holy-queen")
                    )
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => jumpToStep(s.id)}
                        className={`text-left p-2.5 rounded-lg transition-colors truncate ${
                          currentStepIndex === s.id
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-card text-foreground"
                        }`}
                      >
                        {s.decadeLabel}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Narration Controls Bar (English & Chinese) */}
        <div className="relative px-6 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/40 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Play/Pause button & prayer title/progress */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudioPlay}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                isAudioPlaying
                  ? "bg-primary text-primary-foreground shadow-primary/30 ring-4 ring-primary/20 scale-105"
                  : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-105"
              }`}
              title={isAudioPlaying ? (locale === "zh-TW" ? "暫停語音" : "Pause Audio") : (locale === "zh-TW" ? "播放語音" : "Play Audio")}
            >
              {isAudioPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground">
                  {reflectionCountdown !== null
                    ? locale === "zh-TW"
                      ? "默想奧蹟中"
                      : "Reflecting on Mystery"
                    : isAudioPlaying
                    ? currentStep.title
                    : locale === "zh-TW"
                    ? "語音"
                    : "Audio"}
                </span>
                {isAudioPlaying && reflectionCountdown === null && (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-primary rounded-full animate-pulse delay-150" />
                  </span>
                )}
              </div>
              {(reflectionCountdown !== null || isAudioPlaying) && (
                <span className="text-[11px] text-muted-foreground">
                  {reflectionCountdown !== null
                    ? locale === "zh-TW"
                      ? `${reflectionCountdown} 秒後繼續...`
                      : `Continuing in ${reflectionCountdown}s...`
                    : `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`}
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions (Skip reflection if counting down, or Speed control) */}
          <div className="flex items-center gap-2">
            {reflectionCountdown !== null ? (
              <button
                onClick={skipReflection}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all hover:scale-105"
              >
                <span>{locale === "zh-TW" ? "跳過" : "Skip"}</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="relative inline-flex items-center">
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="appearance-none bg-card hover:bg-muted/80 text-foreground font-mono font-bold text-xs pl-2.5 pr-7 py-1 rounded-full border border-border/60 shadow-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-colors"
                  title={locale === "zh-TW" ? "播放速度" : "Playback Speed"}
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={1.75}>1.75x</option>
                  <option value={2}>2.0x</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2" />
              </div>
            )}
          </div>

          {/* Audio Track Progress Indicator Line */}
          {isAudioPlaying && reflectionCountdown === null && duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/40 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime)
              setDuration(audioRef.current.duration || 0)
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || 0)
            }
          }}
          onEnded={handleAudioEnded}
          className="hidden"
        />

        {/* Prayer Text Area with Slide & Swipe Animation */}
        <div className="relative flex-1 p-6 sm:p-8 flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={`${selectedMystery}-${currentStepIndex}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 280, damping: 28 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipePower = Math.abs(offset.x) * velocity.x
                if (swipePower < -8000 || offset.x < -100) {
                  paginate(1)
                } else if (swipePower > 8000 || offset.x > 100) {
                  paginate(-1)
                }
              }}
              className="w-full flex flex-col items-center text-center cursor-grab active:cursor-grabbing"
            >
              {/* Title */}
              <h2
                className={`font-heading font-bold leading-snug mb-4 ${
                  currentStep.prayerType === "mystery"
                    ? "text-2xl sm:text-3xl md:text-4xl text-primary"
                    : "text-xl sm:text-2xl md:text-3xl text-foreground"
                }`}
              >
                {currentStep.title}
              </h2>

              {/* Description / Content */}
              {currentStep.content && (
                <div
                  className={`max-w-xl leading-relaxed sm:leading-loose whitespace-pre-wrap px-2 sm:px-4 ${
                    currentStep.prayerType === "mystery"
                      ? "text-base sm:text-lg text-foreground/80 font-serif italic"
                      : "text-base sm:text-lg text-foreground/90 font-serif"
                  }`}
                >
                  {currentStep.content}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card Footer Navigation Buttons */}
        <div className="p-4 sm:p-6 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-3">
          <button
            onClick={() => paginate(-1)}
            disabled={currentStepIndex === 0 && hailMaryIndex === 1}
            className="flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-border/40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("prev")}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span>{t("stepCount", { current: currentStepIndex + 1, total: steps.length })}</span>
          </div>

          {isLastStep ? (
            <button
              onClick={() => {
                setCurrentStepIndex(0)
                setHailMaryIndex(1)
                setDirection(-1)
                if (isAudioPlaying) {
                  playPrayerAudio(steps[0])
                }
              }}
              className="flex items-center gap-1 px-5 py-2.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("restart")}</span>
            </button>
          ) : (
            <button
              onClick={() => paginate(1)}
              className="flex items-center gap-1 px-5 py-2.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-transform hover:scale-105"
            >
              <span>{t("next")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Completion Banner (shows when on the final step) */}
      {isLastStep && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center flex flex-col items-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">{t("completedTitle")}</h3>
          <p className="text-xs text-muted-foreground max-w-md">{t("completedDesc")}</p>
        </motion.div>
      )}
    </div>
  )
}

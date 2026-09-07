"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  HeartHandshake,
  Play,
  Pause,
  FastForward,
  ChevronDown,
  Type,
  Check,
  Sparkles,
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
const STORAGE_FONT_SIZE_KEY = "mcg_rosary_font_size"

type FontSizeScale = "normal" | "large" | "xlarge"

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
  const [isMysterySelectorOpen, setIsMysterySelectorOpen] = React.useState(false)
  const [fontSizeScale, setFontSizeScale] = React.useState<FontSizeScale>("large")
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

  React.useEffect(() => {
    playbackSpeedRef.current = playbackSpeed
  }, [playbackSpeed])

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

  // Restore saved progress & contemplation preference from localStorage
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

        const savedFontSize = localStorage.getItem(STORAGE_FONT_SIZE_KEY) as FontSizeScale | null
        if (savedFontSize && ["normal", "large", "xlarge"].includes(savedFontSize)) {
          setFontSizeScale(savedFontSize)
        }
      } catch {
        // Ignore storage read errors
      } finally {
        isLoadedRef.current = true
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Persist progress to localStorage
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


  // Cycle font size (normal -> large -> xlarge -> normal)
  const cycleFontSize = () => {
    const nextSize: FontSizeScale =
      fontSizeScale === "normal" ? "large" : fontSizeScale === "large" ? "xlarge" : "normal"
    setFontSizeScale(nextSize)
    try {
      localStorage.setItem(STORAGE_FONT_SIZE_KEY, nextSize)
    } catch {
      // Ignore storage errors
    }
  }

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
      setIsMysterySelectorOpen(false)
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
        if (currentStep.prayerType === "hail-mary" && hailMaryIndex > 1) {
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
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
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

  const activeMysteryItem = mysteryTypes.find((m) => m.type === selectedMystery) || mysteryTypes[0]

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      filter: "blur(4px)",
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
      const timer = setTimeout(() => {
        playPrayerAudio(step)
      }, 0)
      return () => clearTimeout(timer)
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
    const currentAudio = audioRef.current
    return () => {
      if (currentAudio) {
        currentAudio.pause()
      }
      if (reflectionTimerRef.current) {
        clearInterval(reflectionTimerRef.current)
      }
    }
  }, [])

  // Font size styling mappings
  const prayerTextSizeClass =
    fontSizeScale === "normal"
      ? "text-base sm:text-lg leading-relaxed"
      : fontSizeScale === "large"
      ? "text-lg sm:text-xl md:text-2xl leading-relaxed sm:leading-loose"
      : "text-xl sm:text-2xl md:text-3xl leading-loose"

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center gap-6 transition-all duration-500">
      {/* Sacred Halo Ambient Glow behind the altar card */}
      <div className="absolute -inset-1 sm:-inset-2 rounded-[2.5rem] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent blur-3xl pointer-events-none opacity-50 dark:opacity-60 transition-opacity duration-700" />

      {/* 1. Main Unified Altar Prayer Card */}
      <div className="relative w-full rounded-[2rem] border border-border/70 shadow-xl bg-card/90 backdrop-blur-md transition-all duration-500 overflow-hidden flex flex-col">
        {/* Top Sanctuary Header Ribbon */}
        <div className="pt-4 px-5 sm:px-7 pb-3 border-b border-border/50 flex items-center justify-between gap-2 bg-muted/15">
          {/* Left: Mystery Badge / Selector trigger */}
          <div className="relative">
            <button
              onClick={() => setIsMysterySelectorOpen(!isMysterySelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 transition-all text-xs font-semibold group cursor-pointer"
              title={t("selectMystery")}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>{activeMysteryItem.label}</span>
              {todaysMystery === activeMysteryItem.type && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary text-primary-foreground">
                  {t("today")}
                </span>
              )}
              <ChevronDown
                className={`w-3 h-3 text-primary transition-transform duration-200 ${
                  isMysterySelectorOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Collapsible Mystery Switcher Dropdown */}
            <AnimatePresence>
              {isMysterySelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-popover/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("selectMystery")}
                  </div>
                  {mysteryTypes.map((item) => {
                    const isSelected = selectedMystery === item.type
                    const isToday = todaysMystery === item.type
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleSelectMystery(item.type)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted/70 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
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
                          className={`text-[10px] font-normal ${
                            isSelected ? "text-primary-foreground/85" : "text-muted-foreground"
                          }`}
                        >
                          {locale === "zh-TW" ? item.daysZh : item.daysEn}
                        </span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Action Tools: Font Size, Quick Jump, Step Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Font Size Toggle */}
            <button
              onClick={cycleFontSize}
              className="px-2.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center gap-1 border border-border/40 cursor-pointer"
              title={`${t("fontSize")}: ${fontSizeScale}`}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase font-bold">
                {fontSizeScale === "normal" ? "A" : fontSizeScale === "large" ? "A+" : "A++"}
              </span>
            </button>

            {/* Quick Jump Drawer Toggle */}
            <button
              onClick={() => setIsJumpMenuOpen(!isJumpMenuOpen)}
              className="px-2.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center gap-1 border border-border/40 cursor-pointer"
              title={t("jumpToSection")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t("jumpToSection")}</span>
            </button>

            {/* Step Counter */}
            <span className="text-[11px] font-mono text-muted-foreground/80 bg-muted/60 px-2 py-1 rounded-full">
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
                        className={`text-left p-2.5 rounded-xl transition-colors truncate cursor-pointer ${
                          currentStepIndex === s.id
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
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

        {/* Decade Navigation Pills */}
        <div className="px-5 sm:px-7 py-2.5 border-b border-border/40 bg-card/40 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {decadePillLabels.map((label, dIdx) => {
            const isActiveDecade = currentStep.decadeIndex === dIdx
            const isPastDecade = currentStep.decadeIndex > dIdx
            return (
              <button
                key={dIdx}
                onClick={() => jumpToDecade(dIdx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  isActiveDecade
                    ? "bg-primary text-primary-foreground shadow-xs font-bold scale-102"
                    : isPastDecade
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* 2. Luminous Rosary Bead Strand (Hail Mary Beads) */}
        {currentStep.prayerType === "hail-mary" && (
          <div className="pt-5 px-6 sm:px-8 pb-3 flex flex-col items-center gap-3 border-b border-border/30 bg-muted/5">
            {/* Bead Counter & Spiritual Context */}
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                {currentStep.totalHailMarys === 10
                  ? locale === "zh-TW"
                    ? `第 ${hailMaryIndex} 遍 · 共 10 遍`
                    : `Bead ${hailMaryIndex} of 10`
                  : locale === "zh-TW"
                  ? `序禱第 ${hailMaryIndex} 遍 · 共 3 遍`
                  : `Introductory Bead ${hailMaryIndex} of 3`}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/70">
                {hailMaryIndex} / {currentStep.totalHailMarys}
              </span>
            </div>

            {/* Liturgical Rosary Bead Strand */}
            <div className="relative w-full flex items-center justify-center py-2">
              {/* Golden Rosary Chain Line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 pointer-events-none" />

              {/* 10 Decade Beads */}
              {currentStep.totalHailMarys === 10 && (
                <div className="relative w-full flex items-center justify-between gap-1 sm:gap-2 z-10 px-1">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const beadNumber = i + 1
                    const isCurrent = hailMaryIndex === beadNumber
                    const isPassed = hailMaryIndex > beadNumber

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectBead(beadNumber)}
                        className={`relative rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
                          isCurrent
                            ? "w-8 h-8 sm:w-9 sm:h-9 bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-primary/25 scale-110 font-bold text-xs"
                            : isPassed
                            ? "w-6 h-6 sm:w-7 sm:h-7 bg-primary/75 hover:bg-primary text-primary-foreground font-semibold text-[10px] shadow-xs"
                            : "w-6 h-6 sm:w-7 sm:h-7 bg-card hover:bg-muted border border-primary/30 text-muted-foreground font-normal text-[10px]"
                        }`}
                        title={`${t("beadProgress", { current: beadNumber, total: 10 })}`}
                      >
                        {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : beadNumber}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 3 Introductory Beads */}
              {currentStep.totalHailMarys === 3 && (
                <div className="relative flex items-center justify-center gap-6 sm:gap-8 z-10">
                  {Array.from({ length: 3 }).map((_, i) => {
                    const beadNumber = i + 1
                    const isCurrent = hailMaryIndex === beadNumber
                    const isPassed = hailMaryIndex > beadNumber

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectBead(beadNumber)}
                        className={`relative rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
                          isCurrent
                            ? "w-10 h-10 bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-primary/25 scale-115 font-bold text-sm"
                            : isPassed
                            ? "w-8 h-8 bg-primary/75 hover:bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
                            : "w-8 h-8 bg-card hover:bg-muted border border-primary/30 text-muted-foreground font-normal text-xs"
                        }`}
                        title={`${t("beadProgress", { current: beadNumber, total: 3 })}`}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : beadNumber}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Sacred Prayer Reading Sanctuary Canvas */}
        <div
          onClick={() => paginate(1)}
          className="relative flex-1 p-6 sm:p-10 flex flex-col items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[420px] select-none cursor-pointer transition-all duration-500"
        >
          {/* Subtle Liturgical Cross Watermark Emblem */}
          <div className="mb-4 text-primary/35 flex flex-col items-center pointer-events-none">
            <svg
              className="w-7 h-7 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="6" y1="8" x2="18" y2="8" />
            </svg>
          </div>

          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={`${selectedMystery}-${currentStepIndex}-${hailMaryIndex}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.25 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipePower = Math.abs(offset.x) * velocity.x
                if (swipePower < -6000 || offset.x < -80) {
                  paginate(1)
                } else if (swipePower > 6000 || offset.x > 80) {
                  paginate(-1)
                }
              }}
              className="w-full flex flex-col items-center text-center max-w-xl mx-auto"
            >
              {/* Section Subtitle (Decade / Intro) */}
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-primary/80 mb-2">
                {currentStep.sectionTitle}
              </span>

              {/* Prayer Title */}
              <h2
                className={`font-serif font-bold tracking-tight leading-snug mb-5 ${
                  currentStep.prayerType === "mystery"
                    ? "text-2xl sm:text-3xl md:text-4xl text-primary"
                    : "text-xl sm:text-2xl md:text-3xl text-foreground"
                }`}
              >
                {currentStep.title}
              </h2>

              {/* Prayer or Mystery Reflection Text */}
              {currentStep.content && (
                <div
                  className={`w-full whitespace-pre-wrap px-2 sm:px-4 font-serif text-foreground/90 transition-all duration-300 ${prayerTextSizeClass} ${
                    currentStep.prayerType === "mystery"
                      ? "italic text-foreground/80 bg-primary/5 rounded-2xl p-5 sm:p-6 border border-primary/20 shadow-xs"
                      : ""
                  }`}
                >
                  {currentStep.content}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Serene Audio Contemplation Pill */}
        <div className="relative px-6 py-2.5 bg-muted/25 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
          {/* Audio Player Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleAudioPlay()
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${
                isAudioPlaying
                  ? "bg-primary text-primary-foreground shadow-primary/30 ring-4 ring-primary/20 scale-105"
                  : "bg-primary/90 text-primary-foreground hover:bg-primary hover:scale-105"
              }`}
              title={
                isAudioPlaying
                  ? locale === "zh-TW"
                    ? "暫停語音"
                    : "Pause Audio"
                  : locale === "zh-TW"
                  ? "播放語音"
                  : "Play Audio"
              }
            >
              {isAudioPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  {reflectionCountdown !== null
                    ? t("meditating")
                    : isAudioPlaying
                    ? currentStep.title
                    : t("audio")}
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
                <span className="text-[10px] text-muted-foreground font-mono">
                  {reflectionCountdown !== null
                    ? locale === "zh-TW"
                      ? `${reflectionCountdown} 秒後自動繼續...`
                      : `Continuing in ${reflectionCountdown}s...`
                    : `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`}
                </span>
              )}
            </div>
          </div>

          {/* Right Action: Skip Reflection or Adjust Speed */}
          <div className="flex items-center gap-2">
            {reflectionCountdown !== null ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  skipReflection()
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all hover:scale-105 cursor-pointer"
              >
                <span>{t("skipReflection")}</span>
                <FastForward className="w-3 h-3" />
              </button>
            ) : (
              <div className="relative inline-flex items-center">
                <select
                  value={playbackSpeed}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="appearance-none bg-card hover:bg-muted/80 text-foreground font-mono font-semibold text-[11px] pl-2.5 pr-6 py-1 rounded-full border border-border/60 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-colors"
                  title={t("speed")}
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={1.75}>1.75x</option>
                  <option value={2}>2.0x</option>
                </select>
                <ChevronDown className="w-3 h-3 text-muted-foreground pointer-events-none absolute right-1.5" />
              </div>
            )}
          </div>

          {/* Audio Track Progress Thin Line */}
          {isAudioPlaying && reflectionCountdown === null && duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/40 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* 5. Altar Footer Navigation Controls */}
        <div className="p-4 sm:p-5 border-t border-border/40 bg-card/70 flex items-center justify-between gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              paginate(-1)
            }}
            disabled={currentStepIndex === 0 && hailMaryIndex === 1}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground transition-all disabled:opacity-25 disabled:cursor-not-allowed border border-border/40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("prev")}</span>
          </button>

          {/* Subtle Keyboard Navigation Tip */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/70 border border-border/40 text-[10px]">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-muted/70 border border-border/40 text-[10px]">
              Space
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-muted/70 border border-border/40 text-[10px]">
              →
            </kbd>
          </div>

          {isLastStep ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentStepIndex(0)
                setHailMaryIndex(1)
                setDirection(-1)
                if (isAudioPlaying) {
                  playPrayerAudio(steps[0])
                }
              }}
              className="flex items-center gap-1.5 px-5 sm:px-6 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 transition-all hover:scale-102 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("restart")}</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                paginate(1)
              }}
              className="flex items-center gap-1.5 px-5 sm:px-6 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 transition-all hover:scale-102 cursor-pointer"
            >
              <span>{t("next")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
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
      </div>

      {/* Completion Banner (shown on final step) */}
      {isLastStep && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 text-center flex flex-col items-center gap-2 shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-foreground">{t("completedTitle")}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
            {t("completedDesc")}
          </p>
        </motion.div>
      )}
    </div>
  )
}

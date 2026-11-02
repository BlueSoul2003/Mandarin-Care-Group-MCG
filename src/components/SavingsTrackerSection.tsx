"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Coins, CheckCircle2, TrendingUp, Loader2, Calendar, User, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"

const KNOWN_MEMBERS = [
  "Gregory Hong",
  "Jacelyn Wai",
  "Brandon Chan",
  "Martin Lau",
  "Elwin Ee",
  "Leon",
  "Siaw Wei",
  "Janet Ling",
  "John Tan",
]

const WEEKS = [
  { code: "W11", label: "W11 (6月第1周)" },
  { code: "W10", label: "W10 (5月第5周)" },
  { code: "W7", label: "W7 (5月第2周)" },
  { code: "W6", label: "W6 (5月第1周)" },
  { code: "W5", label: "W5 (4月第4周)" },
  { code: "W12", label: "W12 (6月第2周)" },
]

interface MemberProgress {
  exists: boolean
  totalSaved: number
  totalWeeksSaved: number
  savedWeeks: string[]
}

export function SavingsTrackerSection() {
  const t = useTranslations("SavingsTracker")
  const [name, setName] = useState("")
  const [selectedWeek, setSelectedWeek] = useState("W11")
  const [progress, setProgress] = useState<MemberProgress | null>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Auto-detect logged-in user name
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          const profileName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0]
          if (profileName && !name) {
            setName(profileName)
          }
        }
      })
    } catch {
      // Supabase client may not be configured in non-browser test environment
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Query participant progress
  const fetchProgress = useCallback(async (memberName: string) => {
    const trimmed = memberName.trim()
    if (trimmed.length < 2) {
      setProgress(null)
      return
    }

    setIsLoadingProgress(true)
    setErrorMessage("")
    try {
      const res = await fetch(`/api/savings?name=${encodeURIComponent(trimmed)}`)
      if (res.ok) {
        const data = await res.json()
        setProgress(data)
      } else {
        setProgress(null)
      }
    } catch {
      setProgress(null)
    } finally {
      setIsLoadingProgress(false)
    }
  }, [])

  // Debounced fetch when name changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (name.trim().length >= 2) {
        fetchProgress(name)
      } else {
        setProgress(null)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [name, fetchProgress])

  const isCurrentWeekSaved = progress?.savedWeeks?.includes(selectedWeek) ?? false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setErrorMessage(t("namePlaceholder"))
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, week: selectedWeek }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMessage(t("successMessage", { name: trimmedName, week: selectedWeek }))
        // Update local progress immediately
        setProgress((prev) => {
          const currentWeeks = prev?.savedWeeks ?? []
          const updatedWeeks = currentWeeks.includes(selectedWeek)
            ? currentWeeks
            : [...currentWeeks, selectedWeek]
          return {
            exists: true,
            totalWeeksSaved: updatedWeeks.length,
            totalSaved: updatedWeeks.length * 10,
            savedWeeks: updatedWeeks,
          }
        })
      } else {
        setErrorMessage(data.error || t("errorMessage"))
      }
    } catch {
      setErrorMessage(t("networkError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="my-8 rounded-3xl border border-border/60 bg-card p-6 sm:p-8 text-left shadow-xs transition-all"
      aria-labelledby="savings-tracker-title"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Coins className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 id="savings-tracker-title" className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        {name.trim().length >= 2 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isLoadingProgress ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("checkingProgress")}
              </span>
            ) : isCurrentWeekSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {selectedWeek}: {t("statusSaved")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                {selectedWeek}: {t("statusPending")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Stats Card (Shown when member data is retrieved) */}
      {progress && progress.exists && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/40">
          <div>
            <span className="text-xs text-muted-foreground block">{t("totalSaved")}</span>
            <span className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              RM {progress.totalSaved}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">{t("weeksCount")}</span>
            <span className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              {progress.totalWeeksSaved}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>{Math.round((progress.totalWeeksSaved / 12) * 100)}% of Goal</span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Member Name Field */}
          <div>
            <label htmlFor="member-name-input" className="block text-xs font-medium text-foreground mb-1.5">
              <User className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
              {t("nameLabel")}
            </label>
            <input
              id="member-name-input"
              list="mcg-members-datalist"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <datalist id="mcg-members-datalist">
              {KNOWN_MEMBERS.map((memberName) => (
                <option key={memberName} value={memberName} />
              ))}
            </datalist>
          </div>

          {/* Week Selector */}
          <div>
            <label htmlFor="week-selector-input" className="block text-xs font-medium text-foreground mb-1.5">
              <Calendar className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
              {t("weekLabel")}
            </label>
            <select
              id="week-selector-input"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            >
              {WEEKS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div role="status" className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-sm border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isCurrentWeekSaved}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition shadow-xs ${
              isCurrentWeekSaved
                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/60"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("submitting")}
              </>
            ) : isCurrentWeekSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {t("savedForWeek", { week: selectedWeek })}
              </>
            ) : (
              <>
                <Coins className="h-4 w-4" />
                {t("submitButton")}
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

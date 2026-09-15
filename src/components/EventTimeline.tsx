"use client"

import * as React from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  ChevronDown,
  CalendarPlus,
  Check,
  Copy,
  ArrowRight,
  Calendar,
} from "lucide-react"
import { getCatholicEventsForYears, type CatholicEventItem } from "@/data/catholic-events"
import { getUtmEventsForYears, type UtmEventItem } from "@/data/utm-events"
import { getPublicHolidaysForYears, type PublicHolidayItem } from "@/data/public-holidays"

export interface NotionTimelineEvent {
  id: string
  slug: string
  title: string
  summary: string
  startDate: string | null
  endDate?: string
  dateLabel?: string
  location?: string
  seriesName?: string
  seriesSlug?: string
  termName?: string
  coverImageUrl?: string
}

export type UnifiedTimelineEvent =
  | (NotionTimelineEvent & { isCatholic: false; isUtm: false; isHoliday: false })
  | (CatholicEventItem & {
      isCatholic: true
      isUtm: false
      isHoliday: false
      endDate?: string
      dateLabel?: string
      location?: string
      seriesName?: string
      seriesSlug?: string
      termName?: string
      coverImageUrl?: string
    })
  | (UtmEventItem & {
      isCatholic: false
      isUtm: true
      isHoliday: false
      location?: string
      seriesName?: string
      seriesSlug?: string
      termName?: string
      coverImageUrl?: string
    })
  | (PublicHolidayItem & {
      isCatholic: false
      isUtm: false
      isHoliday: true
      location?: string
      seriesName?: string
      seriesSlug?: string
      termName?: string
      coverImageUrl?: string
    })

interface MonthGroup {
  monthKey: string
  monthLabel: string
  yearLabel: string
  isCurrentMonth: boolean
  events: UnifiedTimelineEvent[]
}

function getEventDate(event: UnifiedTimelineEvent): string {
  if (event.startDate) return event.startDate
  if (!event.isCatholic && !event.isUtm && !event.isHoliday) {
    if (event.dateLabel) {
      const match = event.dateLabel.match(/\d{4}-\d{2}-\d{2}/)
      if (match) return match[0]
    }
    const slugMatch = event.slug.match(/^(\d{4}-\d{2}-\d{2})/)
    if (slugMatch) return slugMatch[1]
  }
  return ""
}

export function EventTimeline({ events: notionEvents = [] }: { events?: NotionTimelineEvent[] }) {
  const t = useTranslations("Lifestyle")
  const locale = useLocale()
  const isZh = locale === "zh-TW"

  // Determine current year-month (e.g. "2026-09")
  const currentYm = React.useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }, [])

  const currentYearStr = React.useMemo(() => new Date().getFullYear().toString(), [])

  // Extract available years, ensuring 2024, 2025, 2026, 2027 are included
  const availableYears = React.useMemo(() => {
    const yearsSet = new Set<string>(["2024", "2025", "2026", "2027"])
    for (const ev of notionEvents) {
      const d = ev.startDate || ev.slug.match(/^(\d{4})/)?.[1]
      if (d && d.length >= 4) {
        const yr = d.substring(0, 4)
        if (/^\d{4}$/.test(yr)) {
          yearsSet.add(yr)
        }
      }
    }
    return Array.from(yearsSet).sort()
  }, [notionEvents])

  // Selected year state (defaults to current year or latest available year)
  const defaultYear = availableYears.includes(currentYearStr)
    ? currentYearStr
    : availableYears[availableYears.length - 1] || currentYearStr

  const [userSelectedYear, setUserSelectedYear] = React.useState<string | null>(null)
  const selectedYear = userSelectedYear && availableYears.includes(userSelectedYear)
    ? userSelectedYear
    : defaultYear

  // Combine Notion events (labeled MCG Events) with Catholic events, UTM academic events, and Public Holidays
  const combinedEvents = React.useMemo<UnifiedTimelineEvent[]>(() => {
    const numericYears = availableYears.map(Number).filter((y) => !isNaN(y))
    const catholicEvents: UnifiedTimelineEvent[] = getCatholicEventsForYears(numericYears).map((ev) => ({
      ...ev,
      isCatholic: true as const,
      isUtm: false as const,
      isHoliday: false as const,
    }))
    const utmEvents: UnifiedTimelineEvent[] = getUtmEventsForYears(numericYears).map((ev) => ({
      ...ev,
      isCatholic: false as const,
      isUtm: true as const,
      isHoliday: false as const,
    }))
    const holidayEvents: UnifiedTimelineEvent[] = getPublicHolidaysForYears(numericYears).map((ev) => ({
      ...ev,
      isCatholic: false as const,
      isUtm: false as const,
      isHoliday: true as const,
    }))

    const formattedNotion: UnifiedTimelineEvent[] = notionEvents.map((ev) => ({
      ...ev,
      isCatholic: false as const,
      isUtm: false as const,
      isHoliday: false as const,
    }))

    return [...formattedNotion, ...catholicEvents, ...utmEvents, ...holidayEvents]
  }, [notionEvents, availableYears])

  // Group and sort combined events chronologically ascending from January to December (01 to 12)
  const monthGroups = React.useMemo<MonthGroup[]>(() => {
    if (!selectedYear) return []

    // 12 months in ascending order (01 to 12)
    const monthKeys = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, "0")
      return `${selectedYear}-${m}`
    })

    const groupsMap = new Map<string, UnifiedTimelineEvent[]>()
    for (const key of monthKeys) {
      groupsMap.set(key, [])
    }

    // Sort events ascending by date
    const sorted = [...combinedEvents].sort((a, b) => {
      const dateA = getEventDate(a)
      const dateB = getEventDate(b)
      return dateA.localeCompare(dateB)
    })

    for (const ev of sorted) {
      const dateStr = getEventDate(ev)
      if (!dateStr) continue
      const ym = dateStr.substring(0, 7)
      if (groupsMap.has(ym)) {
        groupsMap.get(ym)!.push(ev)
      }
    }

    return monthKeys.map((ym) => {
      const date = new Date(`${ym}-01T00:00:00`)
      const monthLabel = new Intl.DateTimeFormat(isZh ? "zh-TW" : "en-US", {
        month: "long",
      }).format(date)
      const yearLabel = date.getFullYear().toString()

      return {
        monthKey: ym,
        monthLabel: isZh ? `${monthLabel}` : monthLabel,
        yearLabel,
        isCurrentMonth: ym === currentYm,
        events: groupsMap.get(ym) || [],
      }
    })
  }, [combinedEvents, selectedYear, isZh, currentYm])

  // Initially ONLY the current month (or first month in the selected year) is expanded
  const [expandedMonths, setExpandedMonths] = React.useState<Set<string>>(() => {
    const activeYear = availableYears.includes(currentYearStr)
      ? currentYearStr
      : availableYears[availableYears.length - 1] || currentYearStr

    if (activeYear === currentYearStr) {
      return new Set([currentYm])
    }
    return new Set([`${activeYear}-01`])
  })

  // Ref for smooth auto-scroll to the current month
  const currentMonthRef = React.useRef<HTMLDivElement | null>(null)
  const hasAutoScrolled = React.useRef(false)

  React.useEffect(() => {
    // Smoothly scroll down to the current expanded month on initial load or year change
    if (selectedYear === currentYearStr && currentMonthRef.current && !hasAutoScrolled.current) {
      const timer = setTimeout(() => {
        if (currentMonthRef.current) {
          currentMonthRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
          hasAutoScrolled.current = true
        }
      }, 450)
      return () => clearTimeout(timer)
    }
  }, [selectedYear, currentYearStr])

  // Track expanded event card IDs
  const [expandedEventIds, setExpandedEventIds] = React.useState<Set<string>>(() => new Set())
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleSelectYear = (year: string) => {
    setUserSelectedYear(year)
    hasAutoScrolled.current = false
    if (year === currentYearStr) {
      setExpandedMonths(new Set([currentYm]))
    } else {
      // expand January by default for historical years
      setExpandedMonths(new Set([`${year}-01`]))
    }
  }

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(monthKey)) {
        next.delete(monthKey)
      } else {
        next.add(monthKey)
      }
      return next
    })
  }

  const toggleEventExpand = (id: string) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Format short date: e.g. "14 Sep" or "9月14日", or explicit UTM/Holiday dateLabel
  const formatDisplayDate = (event: UnifiedTimelineEvent) => {
    if (event.isUtm || event.isHoliday) {
      return isZh ? event.dateLabel["zh-TW"] : event.dateLabel.en
    }
    if (!event.isCatholic && event.dateLabel && !event.dateLabel.includes("、")) {
      return event.dateLabel
    }
    const dateStr = getEventDate(event)
    if (!dateStr) return (!event.isCatholic && event.dateLabel) || ""
    try {
      const date = new Date(dateStr + "T00:00:00")
      return new Intl.DateTimeFormat(isZh ? "zh-TW" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date)
    } catch {
      return dateStr
    }
  }

  const handleCopy = (e: React.MouseEvent, event: UnifiedTimelineEvent) => {
    e.stopPropagation()
    const eventTitle = event.isCatholic || event.isUtm || event.isHoliday ? (isZh ? event.title["zh-TW"] : event.title.en) : event.title
    const dateStr = formatDisplayDate(event)
    const url = !event.isCatholic && !event.isUtm && !event.isHoliday && typeof window !== "undefined"
      ? `\n${window.location.origin}/events/${event.slug}`
      : ""
    const locationStr = !event.isCatholic && !event.isUtm && !event.isHoliday && event.location ? `\n📍 ${event.location}` : ""
    const textToCopy = `${eventTitle}\n${dateStr}${locationStr}${url}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedId(event.id)
        setTimeout(() => setCopiedId(null), 2000)
      })
    }
  }

  const handleAddToCalendar = (e: React.MouseEvent, event: UnifiedTimelineEvent) => {
    e.stopPropagation()
    const eventTitle = event.isCatholic || event.isUtm || event.isHoliday ? (isZh ? event.title["zh-TW"] : event.title.en) : event.title
    const eventSummary = event.isCatholic || event.isUtm || event.isHoliday ? (isZh ? event.summary["zh-TW"] : event.summary.en) : event.summary
    const dateStr = getEventDate(event)
    const cleanDate = dateStr ? dateStr.replace(/-/g, "") : ""
    const endDateStr = (event.isUtm || event.isHoliday) && event.endDate ? event.endDate.replace(/-/g, "") : cleanDate
    const gcalUrl = new URL("https://calendar.google.com/calendar/render")
    gcalUrl.searchParams.set("action", "TEMPLATE")
    gcalUrl.searchParams.set("text", eventTitle)
    if (cleanDate) {
      gcalUrl.searchParams.set("dates", `${cleanDate}T000000Z/${endDateStr}T235959Z`)
    }
    gcalUrl.searchParams.set("details", eventSummary)
    if (!event.isCatholic && !event.isUtm && !event.isHoliday && event.location) {
      gcalUrl.searchParams.set("location", event.location)
    }

    window.open(gcalUrl.toString(), "_blank", "noopener,noreferrer")
  }

  if (!monthGroups.length) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        {t("emptyTimeline")}
      </div>
    )
  }

  return (
    <section aria-labelledby="timeline-heading" className="w-full max-w-3xl mx-auto">
      {/* Section Header with Tight Spacing */}
      <div className="mb-4 sm:mb-5">
        <h2
          id="timeline-heading"
          className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight"
        >
          {t("timelineTitle")}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-normal">
          {t("timelineSubtitle")}
        </p>
      </div>

      {/* Year Selection Bar: 2024 | 2025 | 2026 */}
      {availableYears.length > 1 && (
        <div
          role="tablist"
          aria-label="Filter events by year"
          className="flex items-center gap-1 sm:gap-2 mb-6 pb-2"
        >
          {availableYears.map((year, idx) => {
            const isSelected = selectedYear === year
            return (
              <React.Fragment key={year}>
                {idx > 0 && (
                  <span className="text-border text-sm select-none mx-0.5" aria-hidden="true">
                    |
                  </span>
                )}
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectYear(year)}
                  className={`px-3 py-1 text-sm sm:text-base font-semibold transition-all rounded-md cursor-pointer select-none ${
                    isSelected
                      ? "text-primary bg-primary/10 border border-primary/20 shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {year}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )}

      {/* Continuous Timeline Container: Connects from January all the way down to December */}
      <div className="relative">
        {/* Continuous Unbroken Vertical Spine connecting all months */}
        <div
          aria-hidden="true"
          className="absolute left-[11px] sm:left-[15px] top-3 bottom-5 w-[2px] bg-gradient-to-b from-primary/60 via-muted-foreground/30 to-primary/50"
        />

        {/* 12 Months: January - December */}
        <div className="space-y-6 sm:space-y-7">
          {monthGroups.map((group) => {
            const isMonthExpanded = expandedMonths.has(group.monthKey)

            return (
              <div
                key={group.monthKey}
                ref={group.isCurrentMonth ? currentMonthRef : null}
                className="relative pl-8 sm:pl-10 scroll-mt-28 group/month"
              >
                {/* Month Marker Node directly centered on the vertical spine */}
                <div
                  aria-hidden="true"
                  className={`absolute left-[5px] sm:left-[9px] top-1 z-20 w-3.5 h-3.5 rounded-full border-[1.5px] transition-all duration-300 flex items-center justify-center ${
                    group.isCurrentMonth
                      ? "border-primary bg-primary ring-4 ring-primary/25 shadow-xs scale-110"
                      : isMonthExpanded
                      ? "border-primary bg-background ring-2 ring-primary/20"
                      : "border-muted-foreground/40 bg-background ring-2 ring-background group-hover/month:border-primary group-hover/month:scale-110"
                  }`}
                >
                  {group.isCurrentMonth && (
                    <div className="w-1 h-1 rounded-full bg-background animate-pulse" />
                  )}
                </div>

                {/* Minimalist Month Header: Title on Left, Chevron on Right, Underline Divider */}
                <button
                  type="button"
                  onClick={() => toggleMonth(group.monthKey)}
                  aria-expanded={isMonthExpanded}
                  className="w-full flex items-center justify-between pb-2 pt-0.5 border-b border-border/80 group-hover/month:border-primary/50 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none cursor-pointer"
                >
                  <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                    {/* Month Name & Year naturally connected */}
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground group-hover/month:text-primary transition-colors tracking-tight">
                        {group.monthLabel}
                      </h3>

                      {/* Year as secondary information */}
                      {group.yearLabel && (
                        <span className="text-sm sm:text-base font-normal text-muted-foreground">
                          {group.yearLabel}
                        </span>
                      )}
                    </div>

                    {/* Current Month Badge */}
                    {group.isCurrentMonth && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-semibold">
                        {t("currentMonth")}
                      </span>
                    )}
                  </div>

                  {/* Minimalist Chevron */}
                  <div
                    className={`w-7 h-7 flex items-center justify-center transition-transform duration-200 ${
                      isMonthExpanded
                        ? "rotate-180 text-primary"
                        : "text-muted-foreground group-hover/month:text-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Month Content: Chronological Events along the Spine */}
                <AnimatePresence initial={false}>
                  {isMonthExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3.5 space-y-3.5 sm:space-y-4">
                        {group.events.length > 0 ? (
                          group.events.map((event, idx) => {
                            const isEventExpanded = expandedEventIds.has(event.id)
                            const displayDate = formatDisplayDate(event)
                            const eventTitle = event.isCatholic || event.isUtm || event.isHoliday
                              ? isZh ? event.title["zh-TW"] : event.title.en
                              : event.title
                            const eventSummary = event.isCatholic || event.isUtm || event.isHoliday
                              ? isZh ? event.summary["zh-TW"] : event.summary.en
                              : event.summary
                            const isFirst = idx === 0 && group.isCurrentMonth
                            const hasCover = !event.isCatholic && !event.isUtm && !event.isHoliday && Boolean(event.coverImageUrl)

                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.32,
                                  delay: Math.min(idx * 0.045, 0.3),
                                  ease: [0.25, 0.1, 0.25, 1],
                                }}
                                className="relative group/event"
                              >
                                {/* Perfectly Centered Circular Dot on the Continuous Spine */}
                                <div
                                  aria-hidden="true"
                                  className={`absolute -left-[25px] sm:-left-[29px] top-5 z-10 w-2.5 h-2.5 rounded-full border-[1.5px] transition-all duration-200 ring-4 ring-background ${
                                    isEventExpanded
                                      ? "border-primary bg-primary ring-primary/20 scale-110 shadow-xs"
                                      : isFirst
                                      ? "border-primary bg-primary/30 group-hover/event:bg-primary group-hover/event:scale-110"
                                      : "border-primary/70 bg-background group-hover/event:border-primary group-hover/event:bg-primary/20 group-hover/event:scale-110"
                                  }`}
                                />

                                {/* Crisp Horizontal Connector Line */}
                                <div
                                  aria-hidden="true"
                                  className="absolute -left-[20px] sm:-left-[24px] top-[25px] w-[20px] sm:w-[24px] h-px bg-border/80 group-hover/event:bg-primary/40 transition-colors"
                                />

                                {/* Event Card */}
                                <article
                                  role="button"
                                  tabIndex={0}
                                  aria-expanded={isEventExpanded}
                                  onClick={() => toggleEventExpand(event.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault()
                                      toggleEventExpand(event.id)
                                    }
                                  }}
                                  className={`rounded-xl sm:rounded-2xl bg-card border transition-all duration-200 overflow-hidden cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    isEventExpanded
                                      ? "border-primary/50 shadow-md ring-1 ring-primary/20"
                                      : "border-border/70 shadow-xs hover:border-primary/40 hover:shadow-sm"
                                  }`}
                                >
                                  <div className="p-4 sm:p-5">
                                    {/* Top Row: Badge + Date + Chevron */}
                                    <div className="flex items-center justify-between gap-2.5 mb-2.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {/* Event Badge: Catholic vs UTM vs Public Holiday vs MCG Events */}
                                        {event.isCatholic ? (
                                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                                            {t("badgeCatholic")}
                                          </span>
                                        ) : event.isUtm ? (
                                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                                            {t("badgeUtm")}
                                          </span>
                                        ) : event.isHoliday ? (
                                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                                            {t("badgeHoliday")}
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                                            {t("badgeMcg")}
                                          </span>
                                        )}

                                        {/* Series Badge (for MCG events if present) */}
                                        {!event.isCatholic && !event.isUtm && !event.isHoliday && event.seriesName && (
                                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                                            {event.seriesName}
                                          </span>
                                        )}

                                        {/* Date */}
                                        {displayDate && (
                                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                            <Calendar className="w-3 h-3 text-primary/80" />
                                            <span>{displayDate}</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Event Expand Hint */}
                                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover/event:text-foreground transition-colors">
                                        <span className="hidden sm:inline text-[11px]">
                                          {isEventExpanded ? t("hideDetails") : t("viewDetails")}
                                        </span>
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center bg-muted/60 transition-transform duration-200 ${
                                            isEventExpanded
                                              ? "rotate-180 bg-primary/10 text-primary"
                                              : ""
                                          }`}
                                        >
                                          <ChevronDown className="w-3 h-3" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-heading text-base sm:text-lg font-bold text-foreground leading-snug group-hover/event:text-primary transition-colors">
                                      {eventTitle}
                                    </h4>

                                    {/* Meta: Location (if present) */}
                                    {!event.isCatholic && !event.isUtm && !event.isHoliday && event.location && (
                                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5 text-primary/80 flex-shrink-0" />
                                        <span>{event.location}</span>
                                      </div>
                                    )}

                                    {/* Short Description */}
                                    {eventSummary && (
                                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                        {eventSummary}
                                      </p>
                                    )}

                                    {/* Expandable Details Area */}
                                    <AnimatePresence initial={false}>
                                      {isEventExpanded && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.25, ease: "easeInOut" }}
                                          className="overflow-hidden"
                                        >
                                          <div className="pt-4 mt-4 border-t border-border/60 space-y-3.5">
                                            {/* Cover image preview if available */}
                                            {hasCover && event.coverImageUrl && (
                                              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-muted/30">
                                                <Image
                                                  src={event.coverImageUrl}
                                                  alt={eventTitle}
                                                  fill
                                                  sizes="(max-width: 768px) 100vw, 600px"
                                                  className="object-cover"
                                                />
                                              </div>
                                            )}

                                            {/* Full Summary */}
                                            <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">
                                              {eventSummary}
                                            </p>

                                            {/* Term Context (for MCG events) */}
                                            {!event.isCatholic && !event.isUtm && !event.isHoliday && event.termName && (
                                              <p className="text-xs text-muted-foreground">
                                                {event.termName}
                                              </p>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap items-center gap-2 pt-1.5">
                                              {/* Link to Notion event page (for MCG events) */}
                                              {!event.isCatholic && !event.isUtm && !event.isHoliday && (
                                                <Link
                                                  href={`/events/${event.slug}`}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-98 transition-all"
                                                >
                                                  <span>{t("viewEventPage")}</span>
                                                  <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                              )}

                                              {/* Add to Calendar */}
                                              <button
                                                type="button"
                                                onClick={(e) => handleAddToCalendar(e, event)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted active:scale-98 transition-all"
                                              >
                                                <CalendarPlus className="w-3.5 h-3.5" />
                                                <span>{t("addToCalendar")}</span>
                                              </button>

                                              {/* Copy Details */}
                                              <button
                                                type="button"
                                                onClick={(e) => handleCopy(e, event)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted active:scale-98 transition-all ml-auto"
                                              >
                                                {copiedId === event.id ? (
                                                  <>
                                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                      {t("linkCopied")}
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>{t("copyLink")}</span>
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </article>
                              </motion.div>
                            )
                          })
                        ) : (
                          <div className="py-2.5 pl-2 text-xs text-muted-foreground/75 italic">
                            {t("noEventsThisMonth")}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

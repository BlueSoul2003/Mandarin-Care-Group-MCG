"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"
import {
  CalendarPlus,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react"
import { getCatholicEventsForYears, type CatholicEventItem } from "@/data/catholic-events"
import { getUtmEventsForYears, type UtmEventItem } from "@/data/utm-events"
import { getPublicHolidaysForYears, type PublicHolidayItem } from "@/data/public-holidays"

export interface NotionTimelineEvent {
  id: string
  slug: string
  title: string
  summary: string
  type?: string
  startDate: string | null
  endDate?: string
  dateLabel?: string
  location?: string
  seriesName?: string
  seriesSlug?: string
  termName?: string
  coverImageUrl?: string
  photoUrl?: string
}

export type UnifiedTimelineEvent =
  | (NotionTimelineEvent & {
      isCatholic: false
      isUtm: false
      isHoliday: false
      isNotion: true
    })
  | (CatholicEventItem & {
      isCatholic: true
      isUtm: false
      isHoliday: false
      isNotion: false
      endDate?: string
      dateLabel?: string
      location?: string
      seriesName?: string
      termName?: string
      slug?: string
      coverImageUrl?: string
      photoUrl?: string
    })
  | (UtmEventItem & {
      isCatholic: false
      isUtm: true
      isHoliday: false
      isNotion: false
      location?: string
      seriesName?: string
      termName?: string
      slug?: string
      coverImageUrl?: string
      photoUrl?: string
    })
  | (PublicHolidayItem & {
      isCatholic: false
      isUtm: false
      isHoliday: true
      isNotion: false
      location?: string
      seriesName?: string
      termName?: string
      slug?: string
      coverImageUrl?: string
      photoUrl?: string
    })

interface MonthGroup {
  monthKey: string
  monthLabel: string
  yearLabel: string
  isCurrentMonth: boolean
  events: UnifiedTimelineEvent[]
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function getNextDayDateString(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + 1)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

function getEventDate(event: UnifiedTimelineEvent): string {
  if (event.startDate) return event.startDate
  if (event.isNotion) {
    if (event.dateLabel) {
      const match = event.dateLabel.match(/\d{4}-\d{2}-\d{2}/)
      if (match) return match[0]
    }
    const slugMatch = event.slug?.match(/^(\d{4}-\d{2}-\d{2})/)
    if (slugMatch) return slugMatch[1]
  }
  return ""
}

export interface EventTimelineProps {
  years?: string[]
  events?: NotionTimelineEvent[]
}

export function EventTimeline({ years, events }: EventTimelineProps = {}) {
  const t = useTranslations("Lifestyle")
  const locale = useLocale()
  const isZh = locale === "zh-TW"

  // Only integrate events from notion if the property named 'Type' is 'EventReg'
  const notionEvents = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return []
    return events.filter((ev) => ev.type === "EventReg")
  }, [events])

  // Determine current year-month (e.g. "2026-09")
  const currentYm = React.useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }, [])

  const currentYearStr = React.useMemo(() => new Date().getFullYear().toString(), [])

  // Available academic & liturgical calendar years, dynamically expanded by Notion events
  const availableYears = React.useMemo(() => {
    const yearsSet = new Set<string>(years && years.length > 0 ? years : ["2026", "2027"])
    for (const ev of notionEvents) {
      const d = ev.startDate || (ev.dateLabel && ev.dateLabel.match(/\d{4}/)?.[0])
      if (d && d.length >= 4) {
        const yr = d.substring(0, 4)
        if (/^\d{4}$/.test(yr)) {
          yearsSet.add(yr)
        }
      }
    }
    return Array.from(yearsSet).sort()
  }, [years, notionEvents])

  // Selected year state (defaults to current year or latest available year)
  const defaultYear = availableYears.includes(currentYearStr)
    ? currentYearStr
    : availableYears[0] || currentYearStr

  const [userSelectedYear, setUserSelectedYear] = React.useState<string | null>(null)
  const selectedYear = userSelectedYear && availableYears.includes(userSelectedYear)
    ? userSelectedYear
    : defaultYear

  // Combine Catholic events, UTM academic events, Public Holidays, and Notion EventReg events
  const combinedEvents = React.useMemo<UnifiedTimelineEvent[]>(() => {
    const numericYears = availableYears.map(Number).filter((y) => !isNaN(y))
    const catholicEvents: UnifiedTimelineEvent[] = getCatholicEventsForYears(numericYears).map((ev) => ({
      ...ev,
      isCatholic: true as const,
      isUtm: false as const,
      isHoliday: false as const,
      isNotion: false as const,
    }))
    const utmEvents: UnifiedTimelineEvent[] = getUtmEventsForYears(numericYears).map((ev) => ({
      ...ev,
      isCatholic: false as const,
      isUtm: true as const,
      isHoliday: false as const,
      isNotion: false as const,
    }))
    const holidayEvents: UnifiedTimelineEvent[] = getPublicHolidaysForYears(numericYears).map((ev) => ({
      ...ev,
      isCatholic: false as const,
      isUtm: false as const,
      isHoliday: true as const,
      isNotion: false as const,
    }))
    const mcgEvents: UnifiedTimelineEvent[] = notionEvents.map((ev) => ({
      ...ev,
      isCatholic: false as const,
      isUtm: false as const,
      isHoliday: false as const,
      isNotion: true as const,
    }))

    return [...catholicEvents, ...utmEvents, ...holidayEvents, ...mcgEvents]
  }, [availableYears, notionEvents])

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

  // Ref for smooth auto-scroll to the current month
  const currentMonthRef = React.useRef<HTMLDivElement | null>(null)
  const hasAutoScrolled = React.useRef(false)

  React.useEffect(() => {
    // Smoothly scroll down to the current month on initial load or year change
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

  const handleSelectYear = (year: string) => {
    setUserSelectedYear(year)
    hasAutoScrolled.current = false
  }

  // Format short date: e.g. "14 Sep 2026" or explicit UTM/Holiday dateLabel
  const formatDisplayDate = (event: UnifiedTimelineEvent) => {
    if (event.isUtm || event.isHoliday) {
      return isZh ? event.dateLabel["zh-TW"] : event.dateLabel.en
    }
    if (event.isNotion && event.dateLabel) {
      return event.dateLabel
    }
    const dateStr = event.startDate
    if (!dateStr) return ""
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

  const handleAddToCalendar = (e: React.MouseEvent, event: UnifiedTimelineEvent) => {
    e.stopPropagation()
    const eventTitle =
      typeof event.title === "string"
        ? event.title
        : isZh
        ? event.title["zh-TW"]
        : event.title.en
    const eventSummary =
      typeof event.summary === "string"
        ? event.summary
        : isZh
        ? event.summary["zh-TW"]
        : event.summary.en
    const startDate = event.startDate
    if (!startDate) return
    const endDate = event.endDate || startDate

    const dtStart = startDate.replace(/-/g, "")
    const dtEnd = getNextDayDateString(endDate)
    const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mandarin Care Group//Event Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id}@mandarincaregroup.org`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${escapeIcsText(eventTitle)}`,
      `DESCRIPTION:${escapeIcsText(eventSummary)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${event.id}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

      {/* Year Selection Bar: 2026 | 2027 */}
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
        <div className="space-y-5 sm:space-y-6">
          {monthGroups.map((group) => {
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
                      : group.events.length > 0
                      ? "border-primary bg-background ring-2 ring-primary/20"
                      : "border-muted-foreground/40 bg-background ring-2 ring-background"
                  }`}
                >
                  {group.isCurrentMonth && (
                    <div className="w-1 h-1 rounded-full bg-background animate-pulse" />
                  )}
                </div>

                {/* Minimalist Month Header: Title on Left, Underline Divider */}
                <header className="w-full flex items-center justify-between pb-1.5 pt-0.5 border-b border-border/80 text-left">
                  <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                    {/* Month Name & Year naturally connected */}
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight">
                        {group.monthLabel}
                      </h3>

                      {/* Year as secondary information */}
                      {group.yearLabel && (
                        <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                          {group.yearLabel}
                        </span>
                      )}
                    </div>

                    {/* Current Month Badge */}
                    {group.isCurrentMonth && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[11px] font-semibold">
                        {t("currentMonth")}
                      </span>
                    )}
                  </div>
                </header>

                {/* Month Content: Chronological Events along the Spine - Compact & Immediately Visible */}
                <div className="pt-2.5 space-y-2.5 sm:space-y-3">
                  {group.events.length > 0 ? (
                    group.events.map((event, idx) => {
                      const displayDate = formatDisplayDate(event)
                      const eventTitle =
                        typeof event.title === "string"
                          ? event.title
                          : isZh
                          ? event.title["zh-TW"]
                          : event.title.en
                      const eventSummary =
                        typeof event.summary === "string"
                          ? event.summary
                          : isZh
                          ? event.summary["zh-TW"]
                          : event.summary.en
                      const isFirst = idx === 0 && group.isCurrentMonth

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.1 }}
                          transition={{
                            duration: 0.3,
                            delay: Math.min(idx * 0.04, 0.2),
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                          className="relative group/event"
                        >
                          {/* Perfectly Centered Circular Dot on the Continuous Spine */}
                          <div
                            aria-hidden="true"
                            className={`absolute -left-[25px] sm:-left-[29px] top-3.5 z-10 w-2.5 h-2.5 rounded-full border-[1.5px] transition-all duration-200 ring-4 ring-background ${
                              isFirst
                                ? "border-primary bg-primary/30 group-hover/event:bg-primary group-hover/event:scale-110"
                                : "border-primary/70 bg-background group-hover/event:border-primary group-hover/event:bg-primary/20 group-hover/event:scale-110"
                            }`}
                          />

                          {/* Crisp Horizontal Connector Line */}
                          <div
                            aria-hidden="true"
                            className="absolute -left-[20px] sm:-left-[24px] top-[19px] w-[20px] sm:w-[24px] h-px bg-border/80 group-hover/event:bg-primary/40 transition-colors"
                          />

                          {/* Compact Event Card */}
                          <article className="rounded-xl bg-card border border-border/70 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all duration-200 overflow-hidden">
                            <div className="p-3 sm:py-3 sm:px-4 space-y-1.5">
                              {/* Top Row: Badges + Date + Quick Actions */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Event Badge: Catholic vs UTM vs Public Holiday vs MCG Event */}
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

                                  {/* Series Badge for Notion event */}
                                  {event.isNotion && event.seriesName && (
                                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                                      {event.seriesName}
                                    </span>
                                  )}

                                  {/* Date */}
                                  {displayDate && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                      <Calendar className="w-3 h-3 text-primary/80" />
                                      <span>{displayDate}</span>
                                    </div>
                                  )}

                                  {/* Location for Notion event */}
                                  {event.isNotion && event.location && (
                                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="w-3 h-3 text-primary/80 flex-shrink-0" />
                                      <span>{event.location}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Action Control: Download .ics */}
                                <div className="flex items-center ml-auto">
                                  <button
                                    type="button"
                                    onClick={(e) => handleAddToCalendar(e, event)}
                                    title={t("addToCalendar")}
                                    className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted active:scale-98 transition-all cursor-pointer shadow-2xs"
                                  >
                                    <CalendarPlus className="w-3 h-3 text-primary/80" />
                                    <span>{t("addToCalendar")}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Title */}
                              <h4 className="font-heading text-sm sm:text-base font-bold text-foreground leading-snug group-hover/event:text-primary transition-colors">
                                {eventTitle}
                              </h4>

                              {/* Description - Preserved in full */}
                              {eventSummary && (
                                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                  {eventSummary}
                                </p>
                              )}

                              {/* Attached Photo for Notion Event */}
                              {event.isNotion && (event.photoUrl || event.coverImageUrl) && (
                                <div className="pt-1.5">
                                  <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                                    <img
                                      src={event.photoUrl || event.coverImageUrl}
                                      alt={eventTitle}
                                      loading="lazy"
                                      className="w-full max-h-60 sm:max-h-80 object-cover rounded-lg transition-transform duration-300 hover:scale-[1.01]"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* View More at bottom for Notion Event */}
                              {event.isNotion && event.slug && (
                                <div className="pt-1 flex items-center justify-end">
                                  <Link
                                    href={`/events/${event.slug}`}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/viewmore"
                                  >
                                    <span>{t("viewMore")}</span>
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/viewmore:translate-x-0.5" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          </article>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="py-1.5 pl-2 text-xs text-muted-foreground/60 italic">
                      {t("noEventsThisMonth")}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

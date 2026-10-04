"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import { ArrowRight, Calendar, CalendarHeart, MapPin, Maximize2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import type { Event } from "@/content"

export interface UpcomingEventsSectionProps {
  events: Array<
    Event & {
      termName?: string
      seriesName?: string
      photoUrl?: string
    }
  >
}

function FormattedSummary({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (!/^https?:\/\//.test(part)) return part
        try {
          const url = new URL(part)
          if (!url.hostname) return part
        } catch {
          return part
        }
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary underline underline-offset-4 hover:opacity-80 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      })}
    </>
  )
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  const t = useTranslations("Home")
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null)
  const hasEvents = events && events.length > 0

  useEffect(() => {
    if (!selectedImage) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage])

  if (!hasEvents) {
    /* Small, elegant empty state: compact bar with fully visible text */
    return (
      <section
        aria-label={t("upcomingEventsTitle")}
        className="w-full max-w-2xl mx-auto my-4 sm:my-5 px-2"
      >
        <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-2xs hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <CalendarHeart className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {t("stayTunedTitle")}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed whitespace-normal mt-0.5">
                {t("stayTunedDesc")}
              </p>
            </div>
          </div>

          <Link
            href="/lifestyle"
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/90 hover:bg-muted hover:border-primary/40 px-3 py-1.5 text-[11px] sm:text-xs font-medium text-foreground hover:text-primary transition-all shrink-0 shadow-2xs self-end sm:self-center"
          >
            <span>{t("viewCalendar")}</span>
            <ArrowRight className="h-3 w-3 text-primary" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section
        aria-labelledby="upcoming-events-heading"
        className="w-full max-w-4xl mx-auto my-5 sm:my-7 text-left"
      >
        {/* Compact Section Header */}
        <div className="mb-4 sm:mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">
              <span>{t("upcomingEventsTag")}</span>
            </div>
            <h2
              id="upcoming-events-heading"
              className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight"
            >
              {t("upcomingEventsTitle")}
            </h2>
          </div>

          <Link
            href="/lifestyle"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 whitespace-nowrap mb-0.5"
          >
            <span>{t("viewCalendar")}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Content-Focused Showcase */}
        <div
          className={`grid gap-4 ${
            events.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {events.map((event) => {
            const photo = event.photoUrl || event.coverImageUrl
            const displayDate = event.dateLabel || event.startDate

            if (events.length === 1) {
              /* Single Event: Full picture presentation with prominent details */
              return (
                <article
                  key={event.id}
                  className="group relative flex flex-col lg:flex-row items-center overflow-hidden rounded-3xl border border-border/70 bg-card hover:border-primary/40 shadow-2xs hover:shadow-xs transition-all duration-200 p-4 sm:p-6 gap-6 lg:gap-8"
                >
                  {/* Full Picture Container: completely uncropped natural display */}
                  <div className="relative w-full lg:w-1/2 flex items-center justify-center">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => photo && setSelectedImage({ url: photo, title: event.title })}
                      onKeyDown={(e) => {
                        if (photo && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault()
                          setSelectedImage({ url: photo, title: event.title })
                        }
                      }}
                      className="relative w-full flex items-center justify-center rounded-2xl overflow-hidden bg-muted/20 border border-border/50 p-2 sm:p-3 cursor-zoom-in group/poster shadow-2xs hover:shadow-xs transition-all"
                      title={t("viewFullPoster")}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={event.title}
                          className="w-auto max-w-full max-h-[520px] sm:max-h-[620px] lg:max-h-[700px] h-auto object-contain rounded-xl shadow-xs transition-transform duration-300 group-hover/poster:scale-[1.01]"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gradient-to-br from-primary/10 via-muted/30 to-background flex items-center justify-center rounded-xl">
                          <Calendar className="w-10 h-10 text-primary/30" />
                        </div>
                      )}

                      {/* Badges on Poster */}
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold shadow-xs">
                          <span>{t("featuredBadge")}</span>
                        </span>

                        {event.type === "EventReg" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-semibold shadow-xs">
                            {t("eventRegBadge")}
                          </span>
                        )}
                      </div>

                      {/* Hover Zoom Prompt */}
                      {photo && (
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/95 text-foreground text-xs font-medium shadow-md border border-border/70 backdrop-blur-xs">
                            <Maximize2 className="w-3.5 h-3.5 text-primary" />
                            <span>{t("viewFullPoster")}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-between self-stretch text-left">
                    <div>
                      {/* Date, Location, Series */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground mb-3">
                        {displayDate && (
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground whitespace-pre-line bg-muted/40 px-2.5 py-1 rounded-md">
                            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>{displayDate}</span>
                          </span>
                        )}

                        {event.location && (
                          <span className="inline-flex items-center gap-1.5 whitespace-pre-line bg-muted/40 px-2.5 py-1 rounded-md">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>{event.location}</span>
                          </span>
                        )}

                        {event.seriesName && (
                          <span className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-muted-foreground whitespace-pre-line">
                            {event.seriesName}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors whitespace-pre-line">
                        <Link href={`/events/${event.slug}`} className="hover:underline">
                          {event.title}
                        </Link>
                      </h3>

                      {/* Summary with line breaks and clickable links */}
                      {event.summary && (
                        <div className="mt-3.5 max-h-[300px] overflow-y-auto pr-2 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/30 pt-3">
                          <FormattedSummary text={event.summary} />
                        </div>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                      {photo && (
                        <button
                          type="button"
                          onClick={() => setSelectedImage({ url: photo, title: event.title })}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-primary" />
                          <span>{t("viewFullPoster")}</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all"
                        >
                          <span>{t("viewEventDetails")}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            }

            /* Multiple Events: 2-column Grid Cards */
            return (
              <article
                key={event.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card hover:border-primary/40 shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                <div>
                  {/* Full Picture Container */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => photo && setSelectedImage({ url: photo, title: event.title })}
                    onKeyDown={(e) => {
                      if (photo && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault()
                        setSelectedImage({ url: photo, title: event.title })
                      }
                    }}
                    className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-h-[460px] bg-muted/20 overflow-hidden flex items-center justify-center p-3 cursor-zoom-in group/poster border-b border-border/40"
                    title={t("viewFullPoster")}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={event.title}
                        loading="lazy"
                        className="w-auto max-w-full max-h-full h-auto object-contain rounded-xl drop-shadow-sm transition-transform duration-300 group-hover/poster:scale-[1.015]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-muted/30 to-background flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-primary/30" />
                      </div>
                    )}

                    {/* Badges on Cover */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-2xs">
                        <span>{t("featuredBadge")}</span>
                      </span>

                      {event.type === "EventReg" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold shadow-2xs">
                          {t("eventRegBadge")}
                        </span>
                      )}
                    </div>

                    {photo && (
                      <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/95 text-foreground text-[10px] font-medium shadow-xs border border-border/50">
                          <Maximize2 className="w-2.5 h-2.5 text-primary" />
                          <span>{t("viewFullPoster")}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                      {displayDate && (
                        <span className="inline-flex items-center gap-1 font-medium text-foreground whitespace-pre-line">
                          <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>{displayDate}</span>
                        </span>
                      )}

                      {event.location && (
                        <span className="inline-flex items-center gap-1 whitespace-pre-line">
                          <MapPin className="w-3 h-3 text-primary/80 flex-shrink-0" />
                          <span>{event.location}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors whitespace-pre-line">
                      <Link href={`/events/${event.slug}`} className="hover:underline">
                        {event.title}
                      </Link>
                    </h3>

                    {event.summary && (
                      <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line">
                        <FormattedSummary text={event.summary} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Link */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center justify-between">
                  {photo && (
                    <button
                      type="button"
                      onClick={() => setSelectedImage({ url: photo, title: event.title })}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3 text-primary" />
                      <span>{t("viewFullPoster")}</span>
                    </button>
                  )}
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link ml-auto"
                  >
                    <span>{t("viewEventDetails")}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Full-Screen Picture Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              aria-label="Close"
              type="button"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-2.5 rounded-full transition-colors z-20 border border-white/20 backdrop-blur-xs cursor-pointer shadow-lg"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="absolute bottom-4 sm:bottom-6 flex items-center gap-3 z-20">
              <a
                href={selectedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full border border-white/20 bg-black/60 hover:bg-black/80 text-white px-4 py-2 text-xs sm:text-sm font-medium transition-colors shadow-lg backdrop-blur-xs flex items-center gap-1.5"
              >
                <span>查看原圖 / View Original</span>
              </a>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full h-full max-w-5xl max-h-[90vh] flex justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[88vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

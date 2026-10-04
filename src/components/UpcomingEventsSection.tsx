import Image from "next/image"
import { Link } from "@/i18n/routing"
import { ArrowRight, Calendar, CalendarHeart, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
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

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  const t = useTranslations("Home")
  const hasEvents = events && events.length > 0

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

      {/* Compact, Content-Focused Showcase */}
      <div
        className={`grid gap-4 ${
          events.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {events.map((event) => {
          const photo = event.photoUrl || event.coverImageUrl
          const isCloudinary = photo?.includes("res.cloudinary.com")
          const displayDate = event.dateLabel || event.startDate

          if (events.length === 1) {
            /* Single Event: Horizontal Sleek Layout on Desktop */
            return (
              <article
                key={event.id}
                className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-border/70 bg-card hover:border-primary/40 shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                {/* Media Container */}
                <Link
                  href={`/events/${event.slug}`}
                  className="relative w-full sm:w-1/2 min-h-[280px] sm:min-h-[340px] md:min-h-[380px] bg-muted/20 overflow-hidden flex-shrink-0 flex items-center justify-center p-2 group/media block"
                  aria-label={event.title}
                >
                  {photo ? (
                    <>
                      {/* Ambient blur backdrop to fill container edges naturally */}
                      <div className="absolute inset-0 overflow-hidden">
                        {isCloudinary ? (
                          <Image
                            src={photo}
                            alt=""
                            fill
                            aria-hidden="true"
                            className="object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
                          />
                        ) : (
                          <img
                            src={photo}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
                          />
                        )}
                      </div>

                      {/* Full Picture: object-contain ensures the entire image is displayed without cropping */}
                      {isCloudinary ? (
                        <Image
                          src={photo}
                          alt={event.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
                          className="object-contain p-1 drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <img
                          src={photo}
                          alt={event.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-contain p-1 drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted/30 to-background flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary/30" />
                    </div>
                  )}

                  {/* Badges on Cover */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-2xs">
                      <span>{t("featuredBadge")}</span>
                    </span>

                    {event.type === "EventReg" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold shadow-2xs">
                        {t("eventRegBadge")}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Content Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date and Meta */}
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

                      {event.seriesName && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground whitespace-pre-line">
                          {event.seriesName}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors whitespace-pre-line">
                      <Link href={`/events/${event.slug}`} className="hover:underline">
                        {event.title}
                      </Link>
                    </h3>

                    {/* Summary */}
                    {event.summary && (
                      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-line">
                        {event.summary}
                      </p>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="mt-3 sm:mt-4 pt-2 border-t border-border/40 flex items-center justify-end">
                    <Link
                      href={`/events/${event.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                    >
                      <span>{t("viewEventDetails")}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                    </Link>
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
                {/* Media Container */}
                <Link
                  href={`/events/${event.slug}`}
                  className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[220px] bg-muted/20 overflow-hidden flex items-center justify-center p-2 block group/media"
                  aria-label={event.title}
                >
                  {photo ? (
                    <>
                      {/* Ambient blur backdrop to fill container edges naturally */}
                      <div className="absolute inset-0 overflow-hidden">
                        {isCloudinary ? (
                          <Image
                            src={photo}
                            alt=""
                            fill
                            aria-hidden="true"
                            className="object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
                          />
                        ) : (
                          <img
                            src={photo}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
                          />
                        )}
                      </div>

                      {/* Full Picture: object-contain ensures the entire image is displayed without cropping */}
                      {isCloudinary ? (
                        <Image
                          src={photo}
                          alt={event.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain p-1 drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <img
                          src={photo}
                          alt={event.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-contain p-1 drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted/30 to-background flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary/30" />
                    </div>
                  )}

                  {/* Badges on Cover */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-2xs">
                      <span>{t("featuredBadge")}</span>
                    </span>

                    {event.type === "EventReg" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold shadow-2xs">
                        {t("eventRegBadge")}
                      </span>
                    )}
                  </div>
                </Link>

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
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-line">
                      {event.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Link */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center justify-end">
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link"
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
  )
}

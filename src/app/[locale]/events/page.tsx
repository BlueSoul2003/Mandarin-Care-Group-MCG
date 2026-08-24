import { contentRepository } from "@/content"
import { EventCard } from "@/components/EventCard"
import { getTranslations } from "next-intl/server"

export const revalidate = 300

export default async function EventsPage() {
  const t = await getTranslations("PastEvents")
  const repository = await contentRepository()
  const [events, snapshot] = await Promise.all([
    repository.listPublishedEvents(),
    repository.getPublishedSnapshot(),
  ])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
      <header className="mb-12 text-center md:mb-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
          {t("tag")}
        </p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t("desc")}
        </p>
      </header>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              term={snapshot.terms.find((term) => term.id === event.termId)}
              series={snapshot.series.find((series) => series.id === event.seriesId)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-muted/20 px-6 py-20 text-center">
          <h2 className="font-heading text-2xl font-semibold">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            {t("emptyDesc")}
          </p>
        </div>
      )}
    </div>
  )
}

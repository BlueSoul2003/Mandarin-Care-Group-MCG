import { notFound } from "next/navigation"
import { contentRepository } from "@/content"
import { EventCard } from "@/components/EventCard"

export const revalidate = 3600

export async function generateStaticParams() {
  const repository = await contentRepository()
  const series = await repository.listSeries()
  return series.map((item) => ({ slug: item.slug }))
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const repository = await contentRepository()
  const [series, events, snapshot] = await Promise.all([
    repository.getSeriesBySlug(slug),
    repository.listPublishedEvents(),
    repository.getPublishedSnapshot(),
  ])

  if (!series) notFound()

  const relatedEvents = events.filter((event) => event.seriesId === series.id)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
      <header className="mx-auto mb-14 max-w-3xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
          活動系列
        </p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl">{series.name}</h1>
        {series.summary && (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{series.summary}</p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {relatedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            term={snapshot.terms.find((term) => term.id === event.termId)}
            series={series}
          />
        ))}
      </div>
    </div>
  )
}

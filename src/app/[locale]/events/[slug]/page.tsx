import Image from "next/image"
import { Link } from "@/i18n/routing"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"
import { contentRepository } from "@/content"
import { ArticleCard } from "@/components/ArticleCard"
import { MasonryGrid } from "@/components/MasonryGrid"
import { getTranslations } from "next-intl/server"

export const revalidate = 300

export async function generateStaticParams() {
  const repository = await contentRepository()
  const events = await repository.listPublishedEvents()
  return events.map((event) => ({ slug: event.slug }))
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const repository = await contentRepository()
  const detail = await repository.getEventBySlug(slug)

  if (!detail) notFound()

  const t = await getTranslations("PastEvents")
  const { event, term, series, media, articles } = detail
  const hasCloudinaryCover = event.coverImageUrl?.includes("res.cloudinary.com")

  return (
    <article className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
      <Link
        href="/events"
        className="mb-10 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("backToEvents")}
      </Link>

      <header className="mx-auto mb-12 max-w-4xl text-center">
        {series && (
          <Link
            href={`/series/${series.slug}`}
            className="text-sm font-medium uppercase tracking-widest text-primary"
          >
            {series.name}
          </Link>
        )}
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight md:text-6xl">
          {event.title}
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {event.startDate}
          </span>
          {event.location && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {event.location}
            </span>
          )}
          <span>{term.name}</span>
        </div>
        {event.summary && (
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {event.summary}
          </p>
        )}
      </header>

      <div className="relative mb-16 aspect-video overflow-hidden rounded-2xl border border-border/50 bg-muted/30">
        {hasCloudinaryCover && event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={t("eventCoverAlt", { title: event.title })}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/40 to-background" />
        )}
      </div>

      <section aria-labelledby="event-gallery-title">
        <div className="mb-8">
          <h2 id="event-gallery-title" className="font-heading text-3xl font-bold">
            {t("featuredMemories")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("memoriesNote")}</p>
        </div>
        <MasonryGrid
          images={media.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            date: item.takenAt,
            tags: [],
            type: item.type,
            alt: item.alt,
          }))}
        />
      </section>

      {articles.length > 0 && (
        <section className="mt-20" aria-labelledby="related-articles-title">
          <h2 id="related-articles-title" className="mb-8 font-heading text-3xl font-bold">
            {t("relatedArticles")}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                date={article.publishedAt}
                author={article.authorName}
                tags={article.tags}
                category={article.section}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

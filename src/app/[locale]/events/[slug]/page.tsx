import Image from "next/image"
import { Link } from "@/i18n/routing"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"
import { contentRepository } from "@/content"
import { ArticleCard } from "@/components/ArticleCard"
import { MasonryGrid } from "@/components/MasonryGrid"
import { getTranslations } from "next-intl/server"
import { loadMagazine } from "@/content/magazine"
import { MagazineReader } from "@/components/MagazineReader"

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
  const gallery = await getTranslations("Gallery")
  const magazine = await loadMagazine(event.magazineManifestUrl)
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
            <Calendar className="h-4 w-4" /> {event.dateLabel || event.startDate || gallery("dateUnknown")}
          </span>
          {event.location && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {event.location}
            </span>
          )}
          {term && <span>{term.name}</span>}
        </div>
        {event.summary && (
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {event.summary}
          </p>
        )}
        {magazine && <a className="mt-6 inline-block rounded-full border px-6 py-3 text-sm hover:bg-muted" href="#magazine">{gallery("readMagazine")}</a>}
        {media.some(item => item.type === "video") && <a className="mt-6 mx-2 inline-block rounded-full border px-6 py-3 text-sm hover:bg-muted" href="#videos">{gallery("activityVideos")}</a>}
      </header>

      <div className="relative mb-16 aspect-video overflow-hidden rounded-2xl border border-border/50 bg-muted/30">
        {hasCloudinaryCover && event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={t("eventCoverAlt", { title: event.title })}
            fill
            priority
            unoptimized
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/40 to-background" />
        )}
      </div>

      {media.some(item => item.type === "image") && <section aria-labelledby="event-gallery-title">
        <div className="mb-8">
          <h2 id="event-gallery-title" className="font-heading text-3xl font-bold">
            {t("featuredMemories")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("memoriesNote")}</p>
        </div>
        <MasonryGrid
          images={media.filter(item => item.type === "image").map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            date: item.takenAt || gallery("dateUnknown"),
            poster: item.posterUrl,
            tags: [],
            type: item.type,
            alt: item.alt,
          }))}
        />
      </section>}

      {media.some(item => item.type === "video") && <section id="videos" className="mt-20 scroll-mt-24" aria-labelledby="event-videos-title">
        <h2 id="event-videos-title" className="mb-3 font-heading text-3xl font-bold">{gallery("activityVideos")}</h2>
        <p className="mb-8 text-muted-foreground">{gallery("videosNote")}</p>
        <MasonryGrid images={media.filter(item => item.type === "video").map(item => ({ id: item.id, title: item.title, url: item.url, date: item.takenAt || gallery("dateUnknown"), poster: item.posterUrl, tags: [], type: item.type, alt: item.alt }))} />
      </section>}

      {magazine && <MagazineReader magazine={magazine} title={event.title} />}
      {event.magazineManifestUrl && !magazine && <p className="mt-12 text-muted-foreground">{gallery("magazineUnavailable")}</p>}

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

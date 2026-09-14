import Image from "next/image"
import { Link } from "@/i18n/routing"
import { contentRepository } from "@/content"
import { getTranslations } from "next-intl/server"

export const revalidate = 300

export default async function GalleryPage() {
  const repository = await contentRepository()
  const [events, media, t] = await Promise.all([
    repository.listPublishedEvents(), repository.listPublishedMedia(), getTranslations("Gallery"),
  ])
  const albums = events.filter((event) => event.magazineManifestUrl || media.some((item) => item.eventId === event.id))
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('desc')}
        </p>
      </div>

      {albums.length === 0 ? <p className="py-20 text-center text-muted-foreground">{t("empty")}</p> : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} aria-label={t("openAlbum", { title: event.title })} className="group rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              <div className="relative mb-5 aspect-[3/4] overflow-hidden rounded-lg border bg-muted/30">
                {event.coverImageUrl && <Image src={event.coverImageUrl} alt={event.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none" />}
              </div>
              <p className="mb-2 text-xs text-muted-foreground">{event.dateLabel || event.startDate || t("dateUnknown")}</p>
              <h2 className="font-heading text-xl font-semibold leading-snug">{event.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.summary}</p>
              <p className="mt-4 text-xs text-primary">{t("mediaCount", { count: media.filter((item) => item.eventId === event.id).length })}{event.magazineManifestUrl ? ` · ${t("magazine")}` : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

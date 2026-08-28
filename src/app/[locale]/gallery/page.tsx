import { MasonryGrid } from "@/components/MasonryGrid"
import { contentRepository } from "@/content"
import { getTranslations } from "next-intl/server"

export const revalidate = 300

export default async function GalleryPage() {
  const repository = await contentRepository()
  const media = await repository.listPublishedMedia()
  const images = media.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    date: item.takenAt,
    tags: [],
    type: item.type,
    alt: item.alt,
  }))
  const t = await getTranslations("Gallery")
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('desc')}
        </p>
      </div>

      <MasonryGrid images={images} />
    </div>
  )
}

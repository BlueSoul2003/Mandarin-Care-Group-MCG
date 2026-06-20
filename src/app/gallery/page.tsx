import { MasonryGrid } from "@/components/MasonryGrid"
import { getGalleryImages } from "@/lib/notion"

export const revalidate = 60 // ISR: 60 seconds

export default async function GalleryPage() {
  const images = await getGalleryImages()

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          捕捉每一次相聚的美好瞬間。
        </p>
      </div>

      <MasonryGrid images={images} />
    </div>
  )
}

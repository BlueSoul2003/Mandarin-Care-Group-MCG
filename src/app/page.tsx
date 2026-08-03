import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { contentRepository } from "@/content"

export const revalidate = 3600

const LANDING_LINKS = [
  { href: "/events", label: "歷年活動", description: "依屆期與系列瀏覽 MCG 的共同回憶" },
  { href: "/articles", label: "文章與故事", description: "信仰反思、活動故事與大學生活內容" },
  { href: "/history", label: "歷屆執委", description: "記錄每一屆正式職務與服務傳承" },
]

export default async function Home() {
  const repository = await contentRepository()
  const events = await repository.listPublishedEvents()
  const featuredEvent = events.find((event) => event.featured) ?? events[0]
  const hasCloudinaryCover = featuredEvent?.coverImageUrl?.includes("res.cloudinary.com")

  return (
    <div className="container mx-auto max-w-6xl px-4 py-20 text-center">
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)]">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground font-heading">
          MCG UTM
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mb-8 leading-relaxed">
          UTM 華語天主教大學生的團體、回憶與共同成長空間。
        </p>
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/events"
            className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            探索歷年活動 <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            加入我們
          </Link>
        </div>

        <div className="relative w-full max-w-5xl aspect-video overflow-hidden bg-muted/30 rounded-xl border border-border/50 flex items-center justify-center">
          {hasCloudinaryCover && featuredEvent?.coverImageUrl ? (
            <>
              <Image
                src={featuredEvent.coverImageUrl}
                alt={`${featuredEvent.title} 活動封面`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
              <Link
                href={`/events/${featuredEvent.slug}`}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-left text-white"
              >
                <span className="text-xs uppercase tracking-widest text-white/70">Featured memory</span>
                <span className="mt-2 block font-heading text-2xl font-semibold">{featuredEvent.title}</span>
              </Link>
            </>
          ) : (
            <span className="text-muted-foreground text-sm uppercase tracking-widest">
              MCG Community Archive
            </span>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 py-12 text-left md:grid-cols-3" aria-label="網站內容入口">
        {LANDING_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-heading text-xl font-semibold group-hover:text-primary transition-colors">
              {item.label}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

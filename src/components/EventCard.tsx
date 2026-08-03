import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, MapPin } from "lucide-react"
import type { Event, Series, Term } from "@/content"

export function EventCard({
  event,
  term,
  series,
}: {
  event: Event
  term?: Term
  series?: Series
}) {
  const hasCloudinaryCover = event.coverImageUrl?.includes("res.cloudinary.com")

  return (
    <article className="group overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-[16/9] bg-muted/40 overflow-hidden">
        {hasCloudinaryCover && event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={`${event.title} 活動封面`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/40 to-background" />
        )}
        {series && (
          <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
            {series.name}
          </span>
        )}
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {event.startDate}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          )}
          {term && <span>{term.name}</span>}
        </div>

        <h2 className="font-heading text-2xl font-semibold leading-snug">
          <Link href={`/events/${event.slug}`} className="hover:text-primary transition-colors">
            {event.title}
          </Link>
        </h2>
        {event.summary && (
          <p className="mt-4 line-clamp-3 leading-relaxed text-muted-foreground">
            {event.summary}
          </p>
        )}
        <Link
          href={`/events/${event.slug}`}
          className="mt-6 inline-flex items-center text-sm font-medium text-primary"
        >
          查看活動紀錄 <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

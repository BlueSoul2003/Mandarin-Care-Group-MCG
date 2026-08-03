import { contentRepository } from "@/content"
import { EventCard } from "@/components/EventCard"

export const revalidate = 3600

export default async function EventsPage() {
  const repository = await contentRepository()
  const [events, snapshot] = await Promise.all([
    repository.listPublishedEvents(),
    repository.getPublishedSnapshot(),
  ])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
      <header className="mb-12 text-center md:mb-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
          MCG Archive
        </p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl">歷年活動</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          以每一次真實的相聚為單位，保存活動故事、精選照片與延續至今的傳統。
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
          <h2 className="font-heading text-2xl font-semibold">歷史正在整理中</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            完成第一批 Notion 活動資料並同步後，歷屆活動會在這裡依日期呈現。
          </p>
        </div>
      )}
    </div>
  )
}

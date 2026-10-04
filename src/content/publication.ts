import type { PublishedContentSnapshot } from "./model"

type Collection = Exclude<keyof PublishedContentSnapshot, "schemaVersion" | "generatedAt">
export type PublicationVisibility = Partial<Record<Collection, string[]>>

// A completed source query is authoritative even if a later query or field fails.
export class ContentRefreshError extends Error {
  constructor(cause: unknown, readonly visibility: PublicationVisibility) {
    super("Notion content refresh failed", { cause })
  }
}

export function restrictSnapshot(
  snapshot: PublishedContentSnapshot,
  visibility: PublicationVisibility,
): PublishedContentSnapshot {
  const keep = <T extends { id: string }>(items: T[], collection: Collection) => {
    const ids = visibility[collection]
    return ids === undefined ? items : items.filter((item) => ids.includes(item.id))
  }
  const terms = keep(snapshot.terms, "terms")
  const series = keep(snapshot.series, "series")
  const people = keep(snapshot.people, "people")
  const termIds = new Set(terms.map((item) => item.id))
  const seriesIds = new Set(series.map((item) => item.id))
  const personIds = new Set(people.map((item) => item.id))
  const events = keep(snapshot.events, "events").map((event) => ({
    ...event,
    termId: event.termId && termIds.has(event.termId) ? event.termId : undefined,
    seriesId: event.seriesId && seriesIds.has(event.seriesId) ? event.seriesId : undefined,
  }))
  const eventIds = new Set(events.map((item) => item.id))
  return {
    ...snapshot,
    terms, series, people, events,
    committeeRoles: keep(snapshot.committeeRoles, "committeeRoles").filter(
      (role) => personIds.has(role.personId) && termIds.has(role.termId),
    ),
    media: keep(snapshot.media, "media").filter((item) => eventIds.has(item.eventId)),
    articles: keep(snapshot.articles, "articles").map((article) => ({
      ...article, eventIds: article.eventIds.filter((id) => eventIds.has(id)),
    })),
  }
}

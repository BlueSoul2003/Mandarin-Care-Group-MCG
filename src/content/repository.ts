import type {
  Article,
  CommitteeRole,
  Event,
  MediaItem,
  Person,
  PublishedContentSnapshot,
  Series,
  Term,
} from "./model"

export interface TermWithCommittee {
  term: Term
  committee: Array<{ role: CommitteeRole; person: Person }>
}

export interface EventDetail {
  event: Event
  term: Term
  series?: Series
  media: MediaItem[]
  articles: Article[]
}

export interface ContentRepository {
  getPublishedSnapshot(): Promise<PublishedContentSnapshot>
  listPublishedEvents(): Promise<Event[]>
  getEventBySlug(slug: string): Promise<EventDetail | null>
  listSeries(): Promise<Series[]>
  getSeriesBySlug(slug: string): Promise<Series | null>
  listTermsWithCommittees(): Promise<TermWithCommittee[]>
  listPublishedArticles(section?: Article["section"]): Promise<Article[]>
  getArticleBySlug(slug: string): Promise<Article | null>
  listPublishedMedia(): Promise<MediaItem[]>
}

export abstract class SnapshotContentRepository implements ContentRepository {
  abstract getPublishedSnapshot(): Promise<PublishedContentSnapshot>

  async listPublishedEvents() {
    const snapshot = await this.getPublishedSnapshot()
    return [...snapshot.events].sort((a, b) =>
      b.startDate.localeCompare(a.startDate),
    )
  }

  async getEventBySlug(slug: string): Promise<EventDetail | null> {
    const snapshot = await this.getPublishedSnapshot()
    const event = snapshot.events.find((item) => item.slug === slug)
    if (!event) return null

    const term = snapshot.terms.find((item) => item.id === event.termId)
    if (!term) return null

    return {
      event,
      term,
      series: snapshot.series.find((item) => item.id === event.seriesId),
      media: snapshot.media
        .filter((item) => item.eventId === event.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      articles: snapshot.articles
        .filter((article) => article.eventIds.includes(event.id))
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    }
  }

  async listSeries() {
    const snapshot = await this.getPublishedSnapshot()
    return [...snapshot.series].sort((a, b) => a.name.localeCompare(b.name))
  }

  async getSeriesBySlug(slug: string) {
    const snapshot = await this.getPublishedSnapshot()
    return snapshot.series.find((item) => item.slug === slug) ?? null
  }

  async listTermsWithCommittees(): Promise<TermWithCommittee[]> {
    const snapshot = await this.getPublishedSnapshot()

    return [...snapshot.terms]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map((term) => ({
        term,
        committee: snapshot.committeeRoles
          .filter((role) => role.termId === term.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .flatMap((role) => {
            const person = snapshot.people.find(
              (candidate) => candidate.id === role.personId,
            )
            return person ? [{ role, person }] : []
          }),
      }))
  }

  async listPublishedArticles(section?: Article["section"]) {
    const snapshot = await this.getPublishedSnapshot()
    return snapshot.articles
      .filter((article) => !section || article.section === section)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }

  async getArticleBySlug(slug: string) {
    const snapshot = await this.getPublishedSnapshot()
    return snapshot.articles.find((article) => article.slug === slug) ?? null
  }

  async listPublishedMedia() {
    const snapshot = await this.getPublishedSnapshot()
    return [...snapshot.media].sort((a, b) =>
      b.takenAt.localeCompare(a.takenAt),
    )
  }
}

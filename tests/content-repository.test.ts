import { describe, expect, it } from "vitest"
import { ResilientContentRepository } from "../src/content"
import type { PublishedContentSnapshot } from "../src/content/model"
import { SnapshotContentRepository } from "../src/content/repository"

class TestContentRepository extends SnapshotContentRepository {
  constructor(
    private readonly loader: () => Promise<PublishedContentSnapshot>,
  ) {
    super()
  }

  getPublishedSnapshot() {
    return this.loader()
  }
}

describe("resilient content repository", () => {
  it("serves the Git snapshot when the primary source fails", async () => {
    const fallbackSnapshot = {
      schemaVersion: 1,
      generatedAt: "2026-01-01T00:00:00.000Z",
      terms: [],
      series: [],
      people: [],
      committeeRoles: [],
      events: [],
      media: [],
      articles: [
        {
          id: "fallback-article",
          slug: "fallback-article",
          title: "Fallback article",
          excerpt: "Available when Notion is unavailable.",
          publishedAt: "2026-01-01",
          authorName: "MCG Team",
          section: "spiritual",
          tags: [],
          eventIds: [],
          contentMarkdown: "Fallback content.",
          status: "Published",
        },
      ],
    } satisfies PublishedContentSnapshot
    const fallback = new TestContentRepository(async () => fallbackSnapshot)
    const failingPrimary = new TestContentRepository(async () => {
        throw new Error("Notion unavailable")
    })

    const repository = new ResilientContentRepository(
      failingPrimary,
      fallback,
    )

    const articles = await repository.listPublishedArticles("spiritual")

    expect(articles.map((article) => article.slug)).toEqual([
      "fallback-article",
    ])
  })

  it("filters timeline events to only include Type === 'EventReg'", async () => {
    const snapshot = {
      schemaVersion: 1,
      generatedAt: "2026-01-01T00:00:00.000Z",
      terms: [
        {
          id: "term-1",
          name: "2025/2026",
          slug: "2025-2026",
          startDate: "2025-09-01",
          endDate: "2026-08-31",
          status: "Published",
        },
      ],
      series: [
        {
          id: "series-1",
          name: "Camp Series",
          slug: "camp-series",
          summary: "Camp series events",
          status: "Published",
        },
      ],
      people: [],
      committeeRoles: [],
      events: [
        {
          id: "event-reg-1",
          slug: "annual-camp-2026",
          title: "Annual Camp 2026",
          summary: "Registration open",
          type: "EventReg",
          featured: false,
          startDate: "2026-07-10",
          endDate: "2026-07-12",
          termId: "term-1",
          seriesId: "series-1",
          status: "Published",
        },
        {
          id: "event-other",
          slug: "past-memory-event",
          title: "Past Gathering",
          summary: "Old memory",
          type: "PastMemory",
          featured: false,
          startDate: "2026-02-10",
          status: "Published",
        },
        {
          id: "event-untyped",
          slug: "untyped-event",
          title: "Untyped Event",
          summary: "No type specified",
          featured: false,
          startDate: "2026-05-10",
          status: "Published",
        },
      ],
      media: [],
      articles: [],
    } satisfies PublishedContentSnapshot

    const repository = new TestContentRepository(async () => snapshot)
    const timelineEvents = await repository.listTimelineEvents()

    expect(timelineEvents).toHaveLength(1)
    expect(timelineEvents[0].slug).toBe("annual-camp-2026")
    expect(timelineEvents[0].type).toBe("EventReg")
    expect(timelineEvents[0].termName).toBe("2025/2026")
    expect(timelineEvents[0].seriesName).toBe("Camp Series")
  })

  it("filters featured events to only include featured === true", async () => {
    const snapshot = {
      schemaVersion: 1,
      generatedAt: "2026-01-01T00:00:00.000Z",
      terms: [
        {
          id: "term-1",
          name: "2025/2026",
          slug: "2025-2026",
          startDate: "2025-09-01",
          endDate: "2026-08-31",
          status: "Published",
        },
      ],
      series: [
        {
          id: "series-1",
          name: "Camp Series",
          slug: "camp-series",
          summary: "Camp series events",
          status: "Published",
        },
      ],
      people: [],
      committeeRoles: [],
      events: [
        {
          id: "event-1",
          slug: "featured-camp",
          title: "Featured Camp",
          summary: "Highlight event",
          featured: true,
          startDate: "2026-08-01",
          termId: "term-1",
          seriesId: "series-1",
          status: "Published",
        },
        {
          id: "event-2",
          slug: "regular-event",
          title: "Regular Event",
          summary: "Not featured",
          featured: false,
          startDate: "2026-07-01",
          status: "Published",
        },
      ],
      media: [],
      articles: [],
    } satisfies PublishedContentSnapshot

    const repository = new TestContentRepository(async () => snapshot)
    const featured = await repository.listFeaturedEvents()

    expect(featured).toHaveLength(1)
    expect(featured[0].slug).toBe("featured-camp")
    expect(featured[0].featured).toBe(true)
    expect(featured[0].termName).toBe("2025/2026")
    expect(featured[0].seriesName).toBe("Camp Series")
  })
})


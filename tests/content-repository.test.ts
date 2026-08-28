import { describe, expect, it } from "vitest"
import { ResilientContentRepository } from "../src/content"
import type { PublishedContentSnapshot } from "../src/content/model"
import type { ContentRepository } from "../src/content/repository"

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
    const fallback = {
      getPublishedSnapshot: async () => fallbackSnapshot,
    } as unknown as ContentRepository
    const failingPrimary = {
      getPublishedSnapshot: async () => {
        throw new Error("Notion unavailable")
      },
    } as unknown as ContentRepository

    const repository = new ResilientContentRepository(
      failingPrimary,
      fallback,
    )

    const articles = await repository.listPublishedArticles("spiritual")

    expect(articles.map((article) => article.slug)).toEqual([
      "fallback-article",
    ])
  })
})

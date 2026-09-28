import { afterEach, describe, expect, it, vi } from "vitest"
import { ResilientContentRepository } from "../src/content"
import type { PublishedContentSnapshot } from "../src/content/model"
import { SnapshotContentRepository } from "../src/content/repository"

class Source extends SnapshotContentRepository {
  constructor(readonly load: () => Promise<PublishedContentSnapshot>) { super() }
  getPublishedSnapshot() { return this.load() }
}

function snapshot(slug: string): PublishedContentSnapshot {
  return {
    schemaVersion: 1, generatedAt: "2026-09-28T00:00:00.000Z",
    terms: [], series: [], people: [], committeeRoles: [], events: [], media: [],
    articles: [{
      id: slug, slug, title: slug, excerpt: "Prayer", publishedAt: "2026-09-28",
      authorName: "MCG Team", section: "spiritual", tags: [], eventIds: [],
      contentMarkdown: "Prayer text", status: "Published",
    }],
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("Notion refresh lifecycle", () => {
  it("awaits live articles on a cold start, including concurrent detail requests", async () => {
    let resolve!: (value: PublishedContentSnapshot) => void
    const load = vi.fn(() => new Promise<PublishedContentSnapshot>((done) => { resolve = done }))
    const fallback = vi.fn(async () => snapshot("old-prayer"))
    const repository = new ResilientContentRepository(new Source(load), new Source(fallback))
    const list = repository.listPublishedArticles("spiritual")
    const detail = repository.getArticleBySlug("new-prayer")
    resolve(snapshot("new-prayer"))

    expect((await list).map((article) => article.slug)).toEqual(["new-prayer"])
    expect((await detail)?.contentMarkdown).toBe("Prayer text")
    expect(load).toHaveBeenCalledTimes(1)
    expect(fallback).not.toHaveBeenCalled()
  })

  it("refreshes expired data before returning it to the route renderer", async () => {
    vi.useFakeTimers()
    const load = vi.fn()
      .mockResolvedValueOnce(snapshot("old-prayer"))
      .mockResolvedValueOnce(snapshot("new-prayer"))
    const repository = new ResilientContentRepository(new Source(load), new Source(async () => snapshot("backup")))
    await repository.getPublishedSnapshot()
    await repository.getPublishedSnapshot()
    expect(load).toHaveBeenCalledTimes(1)

    vi.setSystemTime(Date.now() + 60_001)
    expect((await repository.listPublishedArticles("spiritual"))[0].slug).toBe("new-prayer")
    expect(await repository.getArticleBySlug("old-prayer")).toBeNull()
    expect(load).toHaveBeenCalledTimes(2)
  })

  it("serves the last live snapshot during an outage and retries after a minute", async () => {
    vi.useFakeTimers()
    vi.spyOn(console, "error").mockImplementation(() => {})
    const load = vi.fn()
      .mockResolvedValueOnce(snapshot("live-prayer"))
      .mockRejectedValueOnce(new Error("Notion unavailable"))
      .mockResolvedValueOnce(snapshot("new-prayer"))
    const repository = new ResilientContentRepository(new Source(load), new Source(async () => snapshot("backup")))
    await repository.getPublishedSnapshot()
    vi.setSystemTime(Date.now() + 60_001)
    expect((await repository.getPublishedSnapshot()).articles[0].slug).toBe("live-prayer")
    expect((await repository.getPublishedSnapshot()).articles[0].slug).toBe("live-prayer")
    expect(load).toHaveBeenCalledTimes(2)
    vi.setSystemTime(Date.now() + 60_001)
    expect((await repository.getPublishedSnapshot()).articles[0].slug).toBe("new-prayer")
    expect(load).toHaveBeenCalledTimes(3)
  })

  it("recovers from a cold-start failure instead of pinning the Git backup", async () => {
    vi.useFakeTimers()
    vi.spyOn(console, "error").mockImplementation(() => {})
    const load = vi.fn()
      .mockRejectedValueOnce(new Error("Notion unavailable"))
      .mockResolvedValueOnce(snapshot("live-prayer"))
    const repository = new ResilientContentRepository(new Source(load), new Source(async () => snapshot("backup")))
    expect((await repository.getPublishedSnapshot()).articles[0].slug).toBe("backup")
    vi.setSystemTime(Date.now() + 60_001)
    expect((await repository.getPublishedSnapshot()).articles[0].slug).toBe("live-prayer")
  })

  it("uses the portable snapshot when no Notion connection is configured", async () => {
    const repository = new ResilientContentRepository(null, new Source(async () => snapshot("backup")))
    expect((await repository.getPublishedSnapshot()).articles[0].slug).toBe("backup")
  })

  it("waits for an expired refresh and shares it across list and detail renders", async () => {
    vi.useFakeTimers()
    let finish!: (value: PublishedContentSnapshot) => void
    const load = vi.fn()
      .mockResolvedValueOnce(snapshot("existing-prayer"))
      .mockImplementationOnce(() => new Promise<PublishedContentSnapshot>((resolve) => { finish = resolve }))
    const repository = new ResilientContentRepository(new Source(load), new Source(async () => snapshot("backup")))
    await repository.getPublishedSnapshot()
    vi.setSystemTime(Date.now() + 60_001)

    let returned = false
    const list = repository.listPublishedArticles("spiritual").then((value) => { returned = true; return value })
    const detail = repository.getArticleBySlug("existing-prayer")
    await Promise.resolve()
    await Promise.resolve()
    expect(returned).toBe(false)
    const updated = snapshot("existing-prayer")
    updated.articles[0].title = "Updated title"
    updated.articles[0].contentMarkdown = "Updated prayer text"
    updated.articles.push(snapshot("new-prayer").articles[0])
    finish(updated)

    expect((await list).map((article) => article.slug)).toEqual(["existing-prayer", "new-prayer"])
    expect(await detail).toMatchObject({ title: "Updated title", contentMarkdown: "Updated prayer text" })
    expect(load).toHaveBeenCalledTimes(2)
  })

  it("removes an unpublished article instead of merging it back from the backup", async () => {
    vi.useFakeTimers()
    const empty = snapshot("prayer")
    empty.articles = []
    const load = vi.fn().mockResolvedValueOnce(snapshot("prayer")).mockResolvedValueOnce(empty)
    const repository = new ResilientContentRepository(new Source(load), new Source(async () => snapshot("prayer")))
    await repository.getPublishedSnapshot()
    vi.setSystemTime(Date.now() + 60_001)
    expect(await repository.listPublishedArticles()).toEqual([])
    expect(await repository.getArticleBySlug("prayer")).toBeNull()
  })
})

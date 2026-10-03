import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { loadNotionPublishedSnapshot, NotionContentRepository } from "../src/content/notion-repository"
import { ResilientContentRepository } from "../src/content"
import { SnapshotContentRepository } from "../src/content/repository"
import { parsePublishedContentSnapshot } from "../src/content/model"

const api = vi.hoisted(() => ({ query: vi.fn(), retrieve: vi.fn(), markdown: vi.fn() }))
vi.mock("@notionhq/client", async (original) => ({
  ...await original<typeof import("@notionhq/client")>(),
  Client: class {
    dataSources = { query: api.query, retrieve: api.retrieve }
    pages = { retrieveMarkdown: api.markdown }
  },
}))

const text = (value: string) => ({ type: "rich_text", rich_text: [{ plain_text: value }] })
const select = (name: string) => ({ type: "select", select: { name } })
const relation = (...ids: string[]) => ({ type: "relation", relation: ids.map((id) => ({ id })) })
const page = (id: string, properties: Record<string, unknown> = {}) => ({
  object: "page", id, url: `https://notion.so/${id}`, archived: false, in_trash: false,
  properties: { Status: select("Published"), Slug: text(id), Title: text(id), ...properties } as Record<string, unknown>,
})
const config = { apiKey: "test", termsDataSourceId: "terms", seriesDataSourceId: "series", peopleDataSourceId: "people", committeeRolesDataSourceId: "roles", eventsDataSourceId: "events", mediaDataSourceId: "media", articlesDataSourceId: "articles" }
let rows: Record<string, ReturnType<typeof page>[]>
beforeEach(() => {
  rows = {
    terms: [page("term", { Name: text("Term"), Dates: { type: "date", date: { start: "2026-01-01", end: "2026-12-31" } } })],
    series: [page("series", { Name: text("Series") })],
    people: [page("person", { Name: text("Person"), ConsentToPublish: { type: "checkbox", checkbox: true } })],
    roles: [page("role", { Role: text("Chair"), Person: relation("person"), Term: relation("term") })],
    events: [page("event", { Type: select("EventReg"), Featured: { type: "checkbox", checkbox: true }, Term: relation("term"), Series: relation("series") })],
    media: [page("photo", { Event: relation("event"), URL: text("https://res.cloudinary.com/test/image.jpg"), AltText: text("Photo") })],
    articles: [page("prayer", { Excerpt: text("Prayer"), Section: select("spiritual"), PublishedAt: { type: "date", date: { start: "2026-10-03" } }, Events: relation("event") })],
  }
  api.retrieve.mockResolvedValue({ properties: { Status: { type: "select" }, Type: { type: "select", select: { options: [{ name: "EventReg" }] } } } })
  api.query.mockImplementation(async ({ data_source_id }) => ({ results: rows[data_source_id], has_more: false }))
  api.markdown.mockResolvedValue({ markdown: "Prayer text" })
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
})
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.resetAllMocks() })

describe("Notion public-content boundary", () => {
  it.each(["select", "status"])("requires Published with %s properties, even when EventReg exists", async (type) => {
    api.retrieve.mockResolvedValue({ properties: { Status: { type }, Type: { type: "multi_select", multi_select: { options: [{ name: "EventReg" }] } }, Featured: { type: "checkbox" } } })
    rows.events.push(...["Draft", "Review", "Archived"].map((status) => page(status.toLowerCase(), { Status: { type, [type]: { name: status } }, Type: select("EventReg") })))
    rows.events.push(page("featured-draft", { Status: select("Draft"), Featured: { type: "checkbox", checkbox: true } }))
    rows.events.push({ ...page("trashed"), in_trash: true }, { ...page("archived"), archived: true })
    const snapshot = await loadNotionPublishedSnapshot(config)
    expect(snapshot.events.map((event) => event.id)).toEqual(["event"])
    for (const [request] of api.query.mock.calls) {
      expect(request.filter).toEqual({ property: "Status", [type]: { equals: "Published" } })
    }
    const repository = new NotionContentRepository(config)
    expect((await repository.listTimelineEvents()).map((event) => event.id)).toEqual(["event"])
    expect(await repository.getEventBySlug("draft")).toBeNull()
    expect((await repository.listFeaturedEvents()).map((event) => event.id)).toEqual(["event"])
  })

  it("removes revoked people and roles while retaining unrelated published content", async () => {
    const before = await loadNotionPublishedSnapshot(config)
    expect(before.people).toHaveLength(1)
    rows.people[0].properties.ConsentToPublish = { type: "checkbox", checkbox: false }
    // A private role must be excluded before even reading its required fields.
    rows.roles[0] = page("role", { Person: relation("person"), Term: relation("term") })
    const after = await loadNotionPublishedSnapshot(config)
    expect(after.people).toEqual([])
    expect(after.committeeRoles).toEqual([])
    expect(after.articles).toHaveLength(1)
    expect(after.events).toHaveLength(1)
  })

  it("projects required and optional relations when their parents are withdrawn", async () => {
    rows.terms = []; rows.series = []; rows.events = []
    const snapshot = await loadNotionPublishedSnapshot(config)
    expect(snapshot.committeeRoles).toEqual([])
    expect(snapshot.media).toEqual([])
    expect(snapshot.articles[0].eventIds).toEqual([])
    rows.events = [page("event", { Term: relation("term"), Series: relation("series") })]
    const withEvent = await loadNotionPublishedSnapshot(config)
    expect(withEvent.events[0].termId).toBeUndefined()
    expect(withEvent.events[0].seriesId).toBeUndefined()
    expect(() => parsePublishedContentSnapshot(withEvent)).not.toThrow()
  })

  it.each([false, true])("does not restore known revocations from fallback (cold=%s) after a later failure", async (cold) => {
    vi.useFakeTimers()
    const backup = await loadNotionPublishedSnapshot(config)
    class Backup extends SnapshotContentRepository { async getPublishedSnapshot() { return backup } }
    const repository = new ResilientContentRepository(new NotionContentRepository(config), new Backup())
    if (!cold) await repository.getPublishedSnapshot()
    rows.people = []; rows.events = []
    api.markdown.mockRejectedValue(new Error("markdown unavailable"))
    vi.setSystemTime(Date.now() + 60_001)
    const snapshot = await repository.getPublishedSnapshot()
    expect(snapshot.people).toEqual([])
    expect(snapshot.committeeRoles).toEqual([])
    expect(snapshot.events).toEqual([])
    expect(snapshot.media).toEqual([])
    expect(snapshot.articles).toEqual([])
    expect(() => parsePublishedContentSnapshot(snapshot)).not.toThrow()
    // A later outage must not resurrect the previously scrubbed identity.
    api.retrieve.mockRejectedValue(new Error("offline"))
    vi.setSystemTime(Date.now() + 60_001)
    expect((await repository.getPublishedSnapshot()).people).toEqual([])
  })

  it("honors consent already fetched even if a later collection query fails", async () => {
    const backup = await loadNotionPublishedSnapshot(config)
    class Backup extends SnapshotContentRepository { async getPublishedSnapshot() { return backup } }
    rows.people[0].properties.ConsentToPublish = { type: "checkbox", checkbox: false }
    api.query.mockImplementation(async ({ data_source_id }) => {
      if (data_source_id === "roles") throw new Error("offline")
      return { results: rows[data_source_id], has_more: false }
    })
    const repository = new ResilientContentRepository(new NotionContentRepository(config), new Backup())
    expect((await repository.getPublishedSnapshot()).people).toEqual([])
    expect((await repository.getPublishedSnapshot()).committeeRoles).toEqual([])
  })

  it("publishes valid new articles even when another article has invalid fields", async () => {
    rows.articles.push(page("invalid", { Excerpt: text("Private raw input should not be logged"), Section: select("unsupported") }))
    const onIssue = vi.fn()
    const snapshot = await loadNotionPublishedSnapshot(config, { onIssue })
    expect(snapshot.articles.map((a) => a.id)).toEqual(["prayer"])
    expect(api.markdown).toHaveBeenCalledTimes(1)
    expect(onIssue).toHaveBeenCalledWith({ collection: "articles", pageId: "invalid", code: "INVALID_FIELDS", fields: ["publishedAt", "section"] })
    expect(JSON.stringify(onIssue.mock.calls)).not.toContain("Private raw input")
  })

  it("omits every duplicate slug while keeping unrelated routes", async () => {
    rows.articles.push(
      page("duplicate-a", { ...rows.articles[0].properties, Slug: text("collision") }),
      page("duplicate-b", { ...rows.articles[0].properties, Slug: text("collision") }),
    )
    const onIssue = vi.fn()
    const snapshot = await loadNotionPublishedSnapshot(config, { onIssue })
    expect(snapshot.articles.map((a) => a.id)).toEqual(["prayer"])
    expect(onIssue.mock.calls.map(([issue]) => issue.code)).toEqual(["DUPLICATE_SLUG", "DUPLICATE_SLUG"])
  })

  it.each(["unavailable", "empty", "truncated", "unknown-block"])("isolates an article body that is %s", async (failure) => {
    rows.articles.push(page("new-prayer", { ...rows.articles[0].properties, Slug: text("new-prayer") }))
    api.markdown.mockImplementation(async ({ page_id }) => {
      if (page_id === "new-prayer") return { markdown: "New valid prayer" }
      if (failure === "unavailable") throw new Error("sensitive provider response")
      return { markdown: failure === "empty" ? " " : "Partial body", truncated: failure === "truncated", unknown_block_ids: failure === "unknown-block" ? ["unknown"] : [] }
    })
    const onIssue = vi.fn()
    const snapshot = await loadNotionPublishedSnapshot(config, { onIssue })
    expect(snapshot.articles.map((a) => a.id)).toEqual(["new-prayer"])
    expect(onIssue.mock.calls[0][0].pageId).toBe("prayer")
    expect(JSON.stringify(onIssue.mock.calls)).not.toContain("sensitive provider response")
  })

  it("refuses to produce a strict backup when any article was skipped", async () => {
    rows.articles.push(page("invalid"))
    await expect(loadNotionPublishedSnapshot(config, { strictArticles: true })).rejects.toMatchObject({
      cause: { issueCount: 1 }, visibility: { articles: ["prayer"] },
    })
  })

  it("does not resurrect invalid articles if whole-snapshot validation later fails", async () => {
    const backup = await loadNotionPublishedSnapshot(config)
    class Backup extends SnapshotContentRepository { async getPublishedSnapshot() { return backup } }
    rows.articles[0].properties.Section = select("invalid")
    rows.events.push(page("other-event", { Slug: text("event") }))
    const repository = new ResilientContentRepository(new NotionContentRepository(config), new Backup())
    const snapshot = await repository.getPublishedSnapshot()
    expect(snapshot.articles).toEqual([])
    expect(snapshot.events.map((event) => event.id)).toEqual(["event"])
  })
})

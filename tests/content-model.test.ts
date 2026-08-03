import { describe, expect, it } from "vitest"
import {
  parsePublishedContentSnapshot,
  type PublishedContentSnapshot,
} from "../src/content/model"

function validSnapshot(): PublishedContentSnapshot {
  return {
    schemaVersion: 1,
    generatedAt: "2026-08-01T00:00:00+08:00",
    terms: [
      {
        id: "term-1",
        slug: "2026-27",
        name: "2026/27",
        startDate: "2026-08-01",
        endDate: "2027-07-31",
        status: "Published",
      },
    ],
    series: [
      {
        id: "series-1",
        slug: "welcome-camp",
        name: "迎新營",
        summary: "每年迎接新朋友。",
        status: "Published",
      },
    ],
    people: [
      {
        id: "person-1",
        slug: "committee-member",
        name: "MCG Member",
        status: "Published",
      },
    ],
    committeeRoles: [
      {
        id: "role-1",
        personId: "person-1",
        termId: "term-1",
        title: "主席",
        sortOrder: 1,
        status: "Published",
      },
    ],
    events: [
      {
        id: "event-1",
        slug: "2026-welcome-camp",
        title: "2026 MCG 迎新營",
        summary: "一起認識 MCG。",
        startDate: "2026-09-01",
        termId: "term-1",
        seriesId: "series-1",
        featured: true,
        status: "Published",
      },
    ],
    media: [
      {
        id: "media-1",
        eventId: "event-1",
        title: "團體照",
        url: "https://res.cloudinary.com/demo/image/upload/group.jpg",
        alt: "迎新營參與者團體照",
        takenAt: "2026-09-01",
        type: "image",
        sortOrder: 1,
        status: "Published",
      },
    ],
    articles: [
      {
        id: "article-1",
        slug: "welcome-camp-reflection",
        title: "迎新營回顧",
        excerpt: "活動回顧。",
        publishedAt: "2026-09-02",
        authorName: "MCG Team",
        section: "community",
        tags: ["迎新"],
        eventIds: ["event-1"],
        contentMarkdown: "一起回顧活動。",
        status: "Published",
      },
    ],
  }
}

describe("published content snapshot", () => {
  it("accepts a connected activity-centered snapshot", () => {
    expect(parsePublishedContentSnapshot(validSnapshot()).events).toHaveLength(1)
  })

  it("rejects broken relations", () => {
    const snapshot = validSnapshot()
    snapshot.events[0].termId = "missing-term"

    expect(() => parsePublishedContentSnapshot(snapshot)).toThrow(
      /Unknown termId/,
    )
  })

  it("rejects more than 30 public media items for one event", () => {
    const snapshot = validSnapshot()
    snapshot.media = Array.from({ length: 31 }, (_, index) => ({
      ...snapshot.media[0],
      id: `media-${index}`,
      sortOrder: index,
    }))

    expect(() => parsePublishedContentSnapshot(snapshot)).toThrow(
      /maximum is 30/,
    )
  })

  it("rejects duplicate public slugs", () => {
    const snapshot = validSnapshot()
    snapshot.events.push({ ...snapshot.events[0], id: "event-2" })

    expect(() => parsePublishedContentSnapshot(snapshot)).toThrow(
      /Duplicate slug/,
    )
  })
})

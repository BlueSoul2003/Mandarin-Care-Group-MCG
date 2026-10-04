import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"
import { EventSummary } from "../src/components/EventSummary"
import { MasonryGrid } from "../src/components/MasonryGrid"
import { eventSchema } from "../src/content/model"

describe("event registration presentation", () => {
  it("normalizes escaped newlines for every event consumer", () => {
    const event = eventSchema.parse({ id: "event", slug: "caroling", title: "報佳音", summary: "報名 \\n\nhttps://forms.gle/example", startDate: null, featured: true, status: "Published" })
    expect(event.summary).not.toContain("\\n")
    expect(event.summary).toContain("\nhttps://forms.gle/example")
  })

  it("renders a clickable registration URL and keeps line breaks without raw HTML", () => {
    const html = renderToStaticMarkup(<EventSummary text={'報名 \\nhttps://forms.gle/example\n<script>alert(1)</script>\njavascript:alert(1)'} />)
    expect(html).toContain('href="https://forms.gle/example"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain("whitespace-pre-line")
    expect(html).not.toContain("\\n")
    expect(html).not.toContain("<script>")
    expect(html).not.toContain('href="javascript:')
  })

  it("preserves each image's Cloudinary account and encoded filename in thumbnail URLs", () => {
    const urls = [
      "https://res.cloudinary.com/ptx4ysbo/image/upload/v1791031787/Caroling%20Registration%20Poster.jpg",
      "https://res.cloudinary.com/dzd9npshz/image/upload/v123/old-poster.webp",
    ]
    const html = renderToStaticMarkup(
      <NextIntlClientProvider locale="zh-TW" messages={{ Gallery: {} }}>
        <MasonryGrid images={urls.map((url, i) => ({ id: String(i), title: "Poster", url, date: "2026-10-04", tags: [], type: "image" as const }))} />
      </NextIntlClientProvider>,
    )
    const sources = [...html.matchAll(/src="([^"]+)"/g)].map((match) => new URL(match[1].replaceAll("&amp;", "&"), "https://example.test").searchParams.get("url"))
    expect(sources).toEqual(urls)
    expect(html).not.toContain("res.cloudinary.com/dzd9npshz/image/upload/c_limit")
  })
})

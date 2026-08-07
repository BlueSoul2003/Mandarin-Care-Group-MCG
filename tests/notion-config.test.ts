import { describe, expect, it } from "vitest"
import { getNotionContentConfig } from "../src/content/notion-repository"

const completeEnvironment = {
  NOTION_API_KEY: "secret",
  NOTION_TERMS_DATA_SOURCE_ID: "terms",
  NOTION_SERIES_DATA_SOURCE_ID: "series",
  NOTION_PEOPLE_DATA_SOURCE_ID: "people",
  NOTION_COMMITTEE_ROLES_DATA_SOURCE_ID: "roles",
  NOTION_EVENTS_DATA_SOURCE_ID: "events",
  NOTION_MEDIA_DATA_SOURCE_ID: "media",
  NOTION_ARTICLES_DATA_SOURCE_ID: "articles",
}

describe("Notion content configuration", () => {
  it("requires every activity-centered data source", () => {
    expect(
      getNotionContentConfig({
        ...completeEnvironment,
        NOTION_EVENTS_DATA_SOURCE_ID: undefined,
      }),
    ).toBeNull()
  })

  it("returns a configuration only when it is complete", () => {
    expect(getNotionContentConfig(completeEnvironment)).toMatchObject({
      eventsDataSourceId: "events",
      articlesDataSourceId: "articles",
    })
  })
})

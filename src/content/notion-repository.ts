import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  type PageObjectResponse,
} from "@notionhq/client"
import {
  parsePublishedContentSnapshot,
  articleSchema,
  type Article,
  type PublishedContentSnapshot,
} from "./model"
import { SnapshotContentRepository } from "./repository"
import { ContentRefreshError, type PublicationVisibility } from "./publication"
import { ArticleValidationError, reportContentIssue, type ContentIssue } from "./diagnostics"

type Property = PageObjectResponse["properties"][string]
const articleMetadataSchema = articleSchema.omit({ contentMarkdown: true })

export interface NotionContentConfig {
  apiKey: string
  termsDataSourceId?: string
  seriesDataSourceId?: string
  peopleDataSourceId?: string
  committeeRolesDataSourceId?: string
  eventsDataSourceId?: string
  mediaDataSourceId?: string
  articlesDataSourceId?: string
  legacyArticlesDatabaseId?: string
}

const configKeys = [
  "NOTION_TERMS_DATA_SOURCE_ID",
  "NOTION_SERIES_DATA_SOURCE_ID",
  "NOTION_PEOPLE_DATA_SOURCE_ID",
  "NOTION_COMMITTEE_ROLES_DATA_SOURCE_ID",
  "NOTION_EVENTS_DATA_SOURCE_ID",
  "NOTION_MEDIA_DATA_SOURCE_ID",
  "NOTION_ARTICLES_DATA_SOURCE_ID",
] as const

export function getNotionContentConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): NotionContentConfig | null {
  if (!environment.NOTION_API_KEY) return null

  const hasCompleteActivityConfig = configKeys.every((key) => environment[key])
  const hasLegacyArticlesConfig = Boolean(environment.NOTION_DATABASE_ID)

  // A partially migrated activity-centered setup is unsafe because events,
  // people, and media have required cross-data-source relations. The original
  // production deployment only had NOTION_DATABASE_ID, so keep that one
  // well-defined legacy shape working while deployments migrate.
  if (!hasCompleteActivityConfig && !hasLegacyArticlesConfig) return null

  return {
    apiKey: environment.NOTION_API_KEY,
    termsDataSourceId: environment.NOTION_TERMS_DATA_SOURCE_ID!,
    seriesDataSourceId: environment.NOTION_SERIES_DATA_SOURCE_ID!,
    peopleDataSourceId: environment.NOTION_PEOPLE_DATA_SOURCE_ID!,
    committeeRolesDataSourceId:
      environment.NOTION_COMMITTEE_ROLES_DATA_SOURCE_ID!,
    eventsDataSourceId: environment.NOTION_EVENTS_DATA_SOURCE_ID!,
    mediaDataSourceId: environment.NOTION_MEDIA_DATA_SOURCE_ID!,
    articlesDataSourceId: environment.NOTION_ARTICLES_DATA_SOURCE_ID!,
    legacyArticlesDatabaseId: environment.NOTION_DATABASE_ID,
  }
}

function property(page: PageObjectResponse, name: string): Property | undefined {
  return page.properties[name]
}

function plainText(page: PageObjectResponse, name: string): string {
  const value = property(page, name)
  if (!value) return ""

  if (value.type === "title") {
    return value.title.map((item) => item.plain_text).join("").trim()
  }
  if (value.type === "rich_text") {
    return value.rich_text.map((item) => item.plain_text).join("").trim()
  }
  if (value.type === "url") return value.url?.trim() ?? ""
  if (value.type === "email") return value.email?.trim() ?? ""
  if (value.type === "phone_number") return value.phone_number?.trim() ?? ""
  if (value.type === "select") return value.select?.name.trim() ?? ""
  if (value.type === "multi_select") {
    return value.multi_select.map((item) => item.name.trim()).join(", ")
  }
  if (value.type === "status") return value.status?.name.trim() ?? ""
  return ""
}

function requiredText(page: PageObjectResponse, name: string): string {
  const value = plainText(page, name)
  if (!value) throw new Error(`Notion page ${page.id} is missing ${name}`)
  return value
}

function dateValue(page: PageObjectResponse, name: string) {
  const value = property(page, name)
  return value?.type === "date" ? value.date : null
}

function numberValue(page: PageObjectResponse, name: string, fallback = 0) {
  const value = property(page, name)
  return value?.type === "number" && value.number !== null
    ? value.number
    : fallback
}

function checkboxValue(page: PageObjectResponse, name: string) {
  const value = property(page, name)
  return value?.type === "checkbox" ? value.checkbox : false
}

function relationIds(page: PageObjectResponse, name: string) {
  const value = property(page, name)
  return value?.type === "relation" ? value.relation.map((item) => item.id) : []
}

function multiSelect(page: PageObjectResponse, name: string) {
  const value = property(page, name)
  return value?.type === "multi_select"
    ? value.multi_select.map((item) => item.name)
    : []
}

function optionalUrl(page: PageObjectResponse, name: string) {
  const direct = plainText(page, name)
  if (direct) return direct

  const value = property(page, name)
  if (value?.type !== "files" || value.files.length === 0) return undefined

  const file = value.files[0]
  if (file.type === "external") return file.external.url
  if (file.type === "file") return file.file.url
  return undefined
}

function requireRelation(page: PageObjectResponse, name: string) {
  const relatedId = relationIds(page, name)[0]
  if (!relatedId) {
    throw new Error(`Notion page ${page.id} is missing ${name} relation`)
  }
  return relatedId
}

async function queryPublished(
  notion: Client,
  dataSourceId: string,
): Promise<PageObjectResponse[]> {
  const dataSource = await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  })
  const statusProperty =
    "properties" in dataSource ? dataSource.properties.Status : undefined
  const statusFilter =
    statusProperty?.type === "status"
      ? { status: { equals: "Published" } }
      : { select: { equals: "Published" } }
  const filter = { property: "Status", ...statusFilter }

  const results = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: dataSourceId,
    filter,
  })

  return results.filter(isFullPage).filter((page) =>
    !page.archived && !page.in_trash && plainText(page, "Status") === "Published",
  )
}

async function resolveLegacyDataSourceId(
  notion: Client,
  databaseId: string,
): Promise<string> {
  const database = await notion.databases.retrieve({ database_id: databaseId })
  const dataSourceId =
    "data_sources" in database ? database.data_sources[0]?.id : undefined

  if (!dataSourceId) {
    throw new Error(
      `Notion database ${databaseId} does not expose a data source for articles`,
    )
  }

  return dataSourceId
}

export async function loadNotionPublishedSnapshot(
  config: NotionContentConfig,
  options: { strictArticles?: boolean; onIssue?: (issue: ContentIssue) => void } = {},
): Promise<PublishedContentSnapshot> {
  const notion = new Client({
    auth: config.apiKey,
    notionVersion: "2025-09-03",
    timeoutMs: 8_000,
    retry: { maxRetries: 2 },
  })

  const visibility: PublicationVisibility = {}
  const query = async (id: string | undefined, collection: keyof PublicationVisibility) => {
    const pages = id ? await queryPublished(notion, id) : []
    const visible = collection === "people"
      ? pages.filter((page) => checkboxValue(page, "ConsentToPublish"))
      : pages
    visibility[collection] = visible.map((page) => page.id)
    return visible
  }
  try {
    const articlesDataSourceId =
      config.articlesDataSourceId ??
      (config.legacyArticlesDatabaseId
        ? await resolveLegacyDataSourceId(
            notion,
            config.legacyArticlesDatabaseId,
          )
        : undefined)

    // Keep these calls sequential to stay comfortably below Notion's API rate limit.
    const termPages = await query(config.termsDataSourceId, "terms")
    const seriesPages = await query(config.seriesDataSourceId, "series")
    const peoplePages = await query(config.peopleDataSourceId, "people")
    const rolePages = await query(config.committeeRolesDataSourceId, "committeeRoles")
    const eventPages = await query(config.eventsDataSourceId, "events")
    const mediaPages = await query(config.mediaDataSourceId, "media")
    const articlePages = await query(articlesDataSourceId, "articles")
    const termIds = new Set(termPages.map((page) => page.id))
    const seriesIds = new Set(seriesPages.map((page) => page.id))
    const personIds = new Set(peoplePages.map((page) => page.id))
    const eventIds = new Set(eventPages.map((page) => page.id))

    const terms = termPages.map((page) => {
      const range = dateValue(page, "Dates")
      return {
        id: page.id,
        slug: requiredText(page, "Slug"),
        name: requiredText(page, "Name"),
        startDate: range?.start ?? "",
        endDate: range?.end ?? range?.start ?? "",
        status: "Published",
      }
    })

    const series = seriesPages.map((page) => ({
      id: page.id,
      slug: requiredText(page, "Slug"),
      name: requiredText(page, "Name"),
      summary: plainText(page, "Summary"),
      status: "Published",
    }))

    const people = peoplePages
      .filter((page) => checkboxValue(page, "ConsentToPublish"))
      .map((page) => ({
        id: page.id,
        slug: requiredText(page, "Slug"),
        name: requiredText(page, "Name"),
        portraitUrl: optionalUrl(page, "PortraitURL"),
        bio: plainText(page, "Bio") || undefined,
        status: "Published",
      }))

    const committeeRoles = rolePages.filter((page) =>
      personIds.has(relationIds(page, "Person")[0]) &&
      termIds.has(relationIds(page, "Term")[0]),
    ).map((page) => ({
      id: page.id,
      personId: requireRelation(page, "Person"),
      termId: requireRelation(page, "Term"),
      title: requiredText(page, "Role"),
      sortOrder: numberValue(page, "SortOrder"),
      status: "Published",
    }))

    const events = eventPages.map((page) => {
      const dates = dateValue(page, "Dates")
      const typeValue = plainText(page, "Type") || undefined
      return {
        id: page.id,
        slug: requiredText(page, "Slug"),
        title: requiredText(page, "Title"),
        summary: plainText(page, "Summary"),
        type: typeValue,
        startDate: dates?.start ?? null,
        endDate: dates?.end ?? undefined,
        dateLabel: plainText(page, "DateLabel") || undefined,
        location: plainText(page, "Location") || undefined,
        termId: relationIds(page, "Term").find((id) => termIds.has(id)),
        seriesId: relationIds(page, "Series").find((id) => seriesIds.has(id)),
        coverImageUrl: optionalUrl(page, "CoverImageURL"),
        magazineManifestUrl: optionalUrl(page, "MagazineManifestURL"),
        featured: checkboxValue(page, "Featured"),
        status: "Published",
      }
    })

    const media = mediaPages.filter((page) => eventIds.has(relationIds(page, "Event")[0])).map((page) => {
      const url = requiredText(page, "URL")
      const selectedType = plainText(page, "Type").toLowerCase()
      const inferredVideo =
        url.includes("/video/upload/") || /\.(mp4|mov|webm|ogg)$/i.test(url)

      return {
        id: page.id,
        eventId: requireRelation(page, "Event"),
        title: requiredText(page, "Title"),
        url,
        alt: requiredText(page, "AltText"),
        takenAt: dateValue(page, "Date")?.start ?? null,
        posterUrl: optionalUrl(page, "PosterImageURL"),
        type: selectedType === "video" || inferredVideo ? "video" : "image",
        sortOrder: numberValue(page, "SortOrder"),
        status: "Published",
      }
    })

    const articles: Article[] = []
    const issues: ContentIssue[] = []
    const onIssue = options.onIssue ?? reportContentIssue
    const reject = (issue: ContentIssue) => {
      issues.push(issue)
      visibility.articles = visibility.articles?.filter((id) => id !== issue.pageId)
      onIssue(issue)
    }
    // Omit every conflicting route, not an arbitrary winner based on query order.
    const slugCounts = new Map<string, number>()
    for (const page of articlePages) {
      const slug = plainText(page, "Slug")
      slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1)
    }
    for (const page of articlePages) {
      const metadata = articleMetadataSchema.safeParse({
        id: page.id,
        slug: plainText(page, "Slug"),
        title: plainText(page, "Title"),
        excerpt: plainText(page, "Excerpt"),
        publishedAt: dateValue(page, "PublishedAt")?.start ?? "",
        authorName: plainText(page, "Author") || "MCG Team",
        section: plainText(page, "Section").toLowerCase(),
        tags: multiSelect(page, "Tags"),
        eventIds: relationIds(page, "Events").filter((id) => eventIds.has(id)),
        status: "Published",
      })
      if (!metadata.success) {
        reject({ collection: "articles", pageId: page.id, code: "INVALID_FIELDS", fields: [...new Set(metadata.error.issues.map((issue) => issue.path.join(".")))] })
        continue
      }
      if (slugCounts.get(metadata.data.slug)! > 1) {
        reject({ collection: "articles", pageId: page.id, code: "DUPLICATE_SLUG", fields: ["slug"] })
        continue
      }
      let body: string
      try {
        const markdown = await notion.pages.retrieveMarkdown({ page_id: page.id })
        if (markdown.truncated || markdown.unknown_block_ids?.length) {
          reject({ collection: "articles", pageId: page.id, code: "INVALID_BODY", fields: ["contentMarkdown"] })
          continue
        }
        body = markdown.markdown
      } catch {
        reject({ collection: "articles", pageId: page.id, code: "BODY_UNAVAILABLE" })
        continue
      }
      const article = articleSchema.safeParse({ ...metadata.data, contentMarkdown: body })
      if (!article.success) {
        reject({ collection: "articles", pageId: page.id, code: "INVALID_BODY", fields: ["contentMarkdown"] })
        continue
      }
      articles.push(article.data)
    }
    if (options.strictArticles && issues.length > 0) {
      throw new ArticleValidationError(issues.length)
    }

    return parsePublishedContentSnapshot({
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      terms,
      series,
      people,
      committeeRoles,
      events,
      media,
      articles,
    })
  } catch (error) {
    throw new ContentRefreshError(error, visibility)
  }
}

export class NotionContentRepository extends SnapshotContentRepository {
  constructor(private readonly config: NotionContentConfig) {
    super()
  }

  getPublishedSnapshot() {
    return loadNotionPublishedSnapshot(this.config)
  }
}

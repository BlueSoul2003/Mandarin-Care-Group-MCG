import { cache } from "react"
import type { PublishedContentSnapshot } from "./model"
import {
  getNotionContentConfig,
  NotionContentRepository,
} from "./notion-repository"
import {
  SnapshotContentRepository,
  type ContentRepository,
} from "./repository"
import { GitSnapshotRepository } from "./snapshot-repository"

export class ResilientContentRepository extends SnapshotContentRepository {
  constructor(
    private readonly primary: ContentRepository | null,
    private readonly fallback: ContentRepository,
  ) {
    super()
  }

  async getPublishedSnapshot(): Promise<PublishedContentSnapshot> {
    if (!this.primary) return this.fallback.getPublishedSnapshot()

    try {
      return await this.primary.getPublishedSnapshot()
    } catch (error) {
      console.error(
        "[MCG content] Notion content failed validation; serving Git snapshot.",
        error,
      )
      return this.fallback.getPublishedSnapshot()
    }
  }
}

const fallbackRepository = new GitSnapshotRepository()
const notionConfig = getNotionContentConfig()
const primaryRepository = notionConfig
  ? new NotionContentRepository(notionConfig)
  : null

const repository = new ResilientContentRepository(
  primaryRepository,
  fallbackRepository,
)

const getRepository = cache(async () => repository)

export async function contentRepository(): Promise<ContentRepository> {
  return getRepository()
}

export type { Article, Event, MediaItem, Series, Term } from "./model"
export type { ContentRepository, EventDetail, TermWithCommittee } from "./repository"

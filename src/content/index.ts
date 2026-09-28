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
  private cachedSnapshot: PublishedContentSnapshot | null = null
  private refreshAfter = 0
  private pendingFetch: Promise<PublishedContentSnapshot> | null = null
  private readonly ttlMs: number

  constructor(
    private readonly primary: ContentRepository | null,
    private readonly fallback: ContentRepository,
    ttlSeconds = 60,
  ) {
    super()
    this.ttlMs = ttlSeconds * 1000
  }

  async getPublishedSnapshot(): Promise<PublishedContentSnapshot> {
    if (this.cachedSnapshot && Date.now() < this.refreshAfter) {
      return this.cachedSnapshot
    }

    if (!this.primary) {
      return this.fallback.getPublishedSnapshot()
    }

    // Keep refresh work inside the render lifetime. An unawaited promise can
    // be suspended on Vercel, and ISR would cache the old Git snapshot again.
    // Share a single fetch between list/detail calls in this server instance.
    if (!this.pendingFetch) {
      this.pendingFetch = this.fetchFromPrimaryOrFallback().finally(() => {
        this.pendingFetch = null
      })
    }
    return this.pendingFetch
  }

  private async fetchFromPrimaryOrFallback(): Promise<PublishedContentSnapshot> {
    try {
      const snapshot = await this.primary!.getPublishedSnapshot()
      this.cachedSnapshot = snapshot
      this.refreshAfter = Date.now() + this.ttlMs
      return snapshot
    } catch (error) {
      console.error(
        "[MCG content] Notion refresh failed; serving the last available snapshot.",
        error,
      )
      if (!this.cachedSnapshot) {
        this.cachedSnapshot = await this.fallback.getPublishedSnapshot()
      }
      this.refreshAfter = Date.now() + 60_000
      return this.cachedSnapshot
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

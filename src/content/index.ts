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
  private lastFetchedAt = 0
  private pendingFetch: Promise<PublishedContentSnapshot> | null = null
  private readonly ttlMs: number

  constructor(
    private readonly primary: ContentRepository | null,
    private readonly fallback: ContentRepository,
    ttlSeconds = 300,
  ) {
    super()
    this.ttlMs = ttlSeconds * 1000
  }

  async getPublishedSnapshot(): Promise<PublishedContentSnapshot> {
    const now = Date.now()

    // 1. Fresh cache: return immediately in < 1ms
    if (this.cachedSnapshot && now - this.lastFetchedAt < this.ttlMs) {
      return this.cachedSnapshot
    }

    // 2. No primary Notion config: return fallback immediately
    if (!this.primary) {
      return this.fallback.getPublishedSnapshot()
    }

    // 3. Stale-While-Revalidate: If we have an existing cache, return it immediately
    // and refresh in the background so the user never waits
    if (this.cachedSnapshot) {
      this.refreshInBackground()
      return this.cachedSnapshot
    }

    // 4. Cold start: Serve the offline Git snapshot immediately (< 5ms)
    // while warming up the live Notion data in the background
    this.refreshInBackground()
    return this.fallback.getPublishedSnapshot()
  }

  private async fetchFromPrimaryOrFallback(): Promise<PublishedContentSnapshot> {
    try {
      const snapshot = await this.primary!.getPublishedSnapshot()
      this.cachedSnapshot = snapshot
      this.lastFetchedAt = Date.now()
      return snapshot
    } catch (error) {
      console.error(
        "[MCG content] Notion content failed validation; serving Git snapshot.",
        error,
      )
      const fallbackSnapshot = await this.fallback.getPublishedSnapshot()
      if (!this.cachedSnapshot) {
        this.cachedSnapshot = fallbackSnapshot
        this.lastFetchedAt = Date.now() - this.ttlMs + 60_000 // Retry in 60s
      }
      return fallbackSnapshot
    }
  }

  private refreshInBackground() {
    if (this.pendingFetch) return
    this.pendingFetch = this.fetchFromPrimaryOrFallback().finally(() => {
      this.pendingFetch = null
    })
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

// Warm up the snapshot cache in the background on startup
if (primaryRepository) {
  void repository.getPublishedSnapshot().catch((err) => {
    console.warn("[MCG content] Initial background warm-up deferred:", err)
  })
}

const getRepository = cache(async () => repository)

export async function contentRepository(): Promise<ContentRepository> {
  return getRepository()
}

export type { Article, Event, MediaItem, Series, Term } from "./model"
export type { ContentRepository, EventDetail, TermWithCommittee } from "./repository"

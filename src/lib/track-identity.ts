export interface AudioTrack {
  id: string
  title: string
  url: string
}

// URLs, unlike list positions or display titles, identify the stored object.
export function trackIdFromUrl(url: string): string {
  const prefix = "/api/audio/"
  if (url.startsWith(prefix)) {
    try {
      return `audio:${encodeURIComponent(decodeURIComponent(url.slice(prefix.length)))}`
    } catch {
      // Keep malformed legacy URLs distinct without breaking persisted favorites.
    }
  }
  return `url:${url}`
}

export function sameTrack(a: Pick<AudioTrack, "url"> | null, b: Pick<AudioTrack, "url">): boolean {
  return a !== null && trackIdFromUrl(a.url) === trackIdFromUrl(b.url)
}

export function normalizeTrack<T extends AudioTrack>(track: T): T {
  return { ...track, id: trackIdFromUrl(track.url) }
}

export function restoreFavorites(value: unknown): AudioTrack[] {
  if (!value || typeof value !== "object" || !("favorites" in value) || !Array.isArray(value.favorites)) return []
  const tracks = new Map<string, AudioTrack>()
  for (const item of value.favorites) {
    if (!item || typeof item !== "object" || typeof item.url !== "string" || !item.url || typeof item.title !== "string") continue
    const id = trackIdFromUrl(item.url)
    tracks.set(id, { id, title: item.title, url: item.url })
  }
  return [...tracks.values()]
}

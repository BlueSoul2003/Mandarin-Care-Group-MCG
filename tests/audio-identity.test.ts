import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { normalizeTrack, restoreFavorites, sameTrack } from "../src/lib/track-identity"
import { usePlayerStore } from "../src/store/usePlayerStore"

const a = { id: "1", title: "Prayer", url: "/api/audio/alpha.mp3" }
const b = { id: "1", title: "Prayer", url: "/api/audio/beta.mp3" }
let storage: Map<string, string>
beforeEach(() => {
  vi.resetModules()
  storage = new Map()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  })
})
afterEach(() => vi.unstubAllGlobals())

describe("song identity across catalog changes", () => {
  it("keeps same-ID and same-title songs separate when a song is inserted", async () => {
    const { useFavoritesStore: store } = await import("../src/store/useFavoritesStore")
    store.getState().toggleFavorite(a)
    expect(store.getState().isFavorite(b)).toBe(false)
    store.getState().toggleFavorite(b)
    expect(store.getState().favorites).toHaveLength(2)
    store.getState().toggleFavorite({ ...a, id: "99", title: "Renamed title" })
    expect(store.getState().favorites).toEqual([normalizeTrack(b)])
  })

  it("rehydrates legacy numeric IDs by URL and preserves favorites after reload", async () => {
    storage.set("mcg_favorite_songs", JSON.stringify({ state: { favorites: [a, b] }, version: 0 }))
    const { useFavoritesStore: store } = await import("../src/store/useFavoritesStore")
    expect(store.getState().favorites).toEqual([normalizeTrack(a), normalizeTrack(b)])
    expect(JSON.parse(storage.get("mcg_favorite_songs")!).version).toBe(1)
    await store.persist.rehydrate()
    expect(store.getState().favorites).toHaveLength(2)
    const reordered = { ...a, id: "2" }
    expect(store.getState().isFavorite(reordered)).toBe(true)
  })

  it("normalizes encoded object paths once without merging different percent-encoded filenames", () => {
    const track = { ...a, url: "/api/audio/folder/祈禱.mp3" }
    const encoded = { ...track, url: `/api/audio/${encodeURIComponent("folder/祈禱.mp3")}` }
    expect(sameTrack(track, encoded)).toBe(true)
    expect(sameTrack({ url: "/api/audio/a%2520b.mp3" }, { url: "/api/audio/a%20b.mp3" })).toBe(false)
    expect(restoreFavorites({ favorites: [track, encoded, null, { url: 3 }] })).toEqual([normalizeTrack(encoded)])
  })

  it("moves through the actual current song after IDs collide or titles repeat", () => {
    const c = { id: "3", title: "Third", url: "/api/audio/third.mp3" }
    usePlayerStore.getState().play(b, [a, b, c])
    usePlayerStore.getState().nextTrack()
    expect(usePlayerStore.getState().currentTrack).toEqual(c)
    usePlayerStore.getState().prevTrack()
    expect(usePlayerStore.getState().currentTrack).toEqual(b)
    usePlayerStore.getState().prevTrack()
    expect(usePlayerStore.getState().currentTrack).toEqual(a)
  })
})

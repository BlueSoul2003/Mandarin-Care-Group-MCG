import { afterEach, beforeEach, expect, it, vi } from "vitest"
const api = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock("@/lib/filebase", () => ({ filebaseS3: api, FILEBASE_BUCKET: "test", FilebaseConfigurationError: class extends Error {}, getS3ErrorName: () => "error" }))
vi.mock("@/lib/track-identity", () => import("../src/lib/track-identity"))
beforeEach(() => vi.resetModules())
afterEach(() => vi.resetAllMocks())

it("returns the same object ID after a new earlier song changes the listing order", async () => {
  const { GET } = await import("../src/app/api/audio/route")
  api.send.mockResolvedValueOnce({ Contents: [{ Key: "b.mp3" }] })
  const first = await (await GET(new Request("https://example.test/api/audio?fresh=true"))).json()
  api.send.mockResolvedValueOnce({ Contents: [{ Key: "a.mp3" }, { Key: "b.mp3" }] })
  const second = await (await GET(new Request("https://example.test/api/audio?fresh=true"))).json()
  expect(first.tracks[0].id).toBe(second.tracks[1].id)
  expect(second.tracks[0].id).not.toBe(second.tracks[1].id)
})

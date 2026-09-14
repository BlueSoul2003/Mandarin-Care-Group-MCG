import { afterEach, expect, it, vi } from "vitest"
import { loadMagazine, magazineSchema } from "../src/content/magazine"

const url = "https://res.cloudinary.com/demo/raw/upload/magazine.json"
const manifest = {
  version: 1,
  pdfUrl: "https://res.cloudinary.com/demo/raw/upload/magazine.pdf",
  pages: ["https://res.cloudinary.com/demo/image/upload/page.webp"],
}
afterEach(() => vi.unstubAllGlobals())
it("accepts a complete magazine and rejects empty pages and foreign assets", () => {
  expect(magazineSchema.parse(manifest).pages).toHaveLength(1)
  expect(magazineSchema.safeParse({ ...manifest, pages: [] }).success).toBe(false)
  expect(magazineSchema.safeParse({ ...manifest, pdfUrl: "https://example.com/file.pdf" }).success).toBe(false)
})
it("does not fetch an untrusted manifest URL", async () => {
  const fetcher = vi.fn()
  vi.stubGlobal("fetch", fetcher)
  expect(await loadMagazine("http://localhost/private")).toBeNull()
  expect(fetcher).not.toHaveBeenCalled()
})
it("loads valid content and leaves event media usable when the magazine fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(manifest))))
  expect(await loadMagazine(url)).toEqual(manifest)
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
  expect(await loadMagazine(url)).toBeNull()
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("invalid JSON")))
  expect(await loadMagazine(url)).toBeNull()
})

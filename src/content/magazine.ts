import { z } from "zod"

const assetUrl = z.string().url().refine((value) => {
  const url = new URL(value)
  return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !url.username && !url.password
})
export const magazineSchema = z.object({
  version: z.literal(1),
  pdfUrl: assetUrl,
  pages: z.array(assetUrl).min(1).max(150),
})
export type Magazine = z.infer<typeof magazineSchema>
export async function loadMagazine(url?: string): Promise<Magazine | null> {
  if (!url || !assetUrl.safeParse(url).success) return null
  try {
    const response = await fetch(url, { next: { revalidate: 300 }, redirect: "error", signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null
    const text = await response.text()
    if (text.length > 100_000) return null
    return magazineSchema.parse(JSON.parse(text))
  } catch {
    return null
  }
}

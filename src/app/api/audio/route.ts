import { NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

const s3 = new S3Client({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.io",
  region: "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY || "",
    secretAccessKey: process.env.FILEBASE_SECRET_KEY || "",
  },
})

// In-memory cache for audio tracks
let cachedTracks: any[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bypassCache = searchParams.get("fresh") === "true"
    const now = Date.now()

    // Serve from cache if fresh
    if (!bypassCache && cachedTracks && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { tracks: cachedTracks, cached: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          },
        }
      )
    }

    const bucket = process.env.FILEBASE_BUCKET || "taize-audio"
    const command = new ListObjectsV2Command({
      Bucket: bucket,
    })

    const response = await s3.send(command)
    const contents = response.Contents || []

    const audioExtensions = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"]

    const tracks = contents
      .filter((item) => {
        if (!item.Key) return false
        const lower = item.Key.toLowerCase()
        return audioExtensions.some((ext) => lower.endsWith(ext))
      })
      .sort((a, b) => {
        const nameA = a.Key || ""
        const nameB = b.Key || ""
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" })
      })
      .map((item, index) => {
        const key = item.Key!
        const title = key.replace(/\.[^/.]+$/, "").replace(/^\d+[\s._-]*/, "")
        return {
          id: String(index + 1),
          title,
          filename: key,
          url: `/api/audio/${encodeURIComponent(key)}`,
          size: item.Size,
          lastModified: item.LastModified,
        }
      })

    cachedTracks = tracks
    cacheTimestamp = now

    return NextResponse.json(
      { tracks, cached: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    )
  } catch (error: any) {
    console.error("Failed to list Filebase audio tracks:", error)
    if (cachedTracks) {
      return NextResponse.json(
        { tracks: cachedTracks, stale: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60",
          },
        }
      )
    }
    return NextResponse.json(
      { error: error?.message || "Failed to list audio tracks", tracks: [] },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { filebaseS3, FILEBASE_BUCKET } from "@/lib/filebase"
import { DEFAULT_ROSARY_AUDIO_MAP } from "@/lib/rosary-data"

let cachedRosaryAudio: { en: Record<string, string>; "zh-TW": Record<string, string> } | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bypassCache = searchParams.get("fresh") === "true"
    const now = Date.now()

    if (!bypassCache && cachedRosaryAudio && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        {
          audioMap: {
            en: cachedRosaryAudio.en,
            "zh-TW": cachedRosaryAudio["zh-TW"],
            ...cachedRosaryAudio.en,
          },
          cached: true,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
          },
        }
      )
    }

    const command = new ListObjectsV2Command({
      Bucket: FILEBASE_BUCKET,
    })

    const response = await filebaseS3.send(command)
    const contents = response.Contents || []

    const enMap: Record<string, string> = { ...DEFAULT_ROSARY_AUDIO_MAP.en }
    const zhMap: Record<string, string> = { ...DEFAULT_ROSARY_AUDIO_MAP["zh-TW"] }

    for (const item of contents) {
      if (!item.Key) continue
      const lower = item.Key.toLowerCase()
      const url = `/api/audio/${encodeURIComponent(item.Key)}`
      const isZh = lower.includes("-zh") || lower.includes("_zh")
      const targetMap = isZh ? zhMap : enMap

      if (lower.includes("sign of the cross")) {
        targetMap["sign-of-cross"] = url
      } else if (lower.includes("apostle") || lower.includes("creed")) {
        targetMap["creed"] = url
      } else if (lower.includes("our father")) {
        targetMap["our-father"] = url
      } else if (lower.includes("hail mary")) {
        targetMap["hail-mary"] = url
      } else if (lower.includes("glory be")) {
        targetMap["glory-be"] = url
      } else if (lower.includes("fatima")) {
        targetMap["fatima"] = url
      } else if (lower.includes("hail holy queen")) {
        targetMap["hail-holy-queen"] = url
      } else if (lower.includes("conclude")) {
        targetMap["concluding"] = url
      }
    }

    cachedRosaryAudio = { en: enMap, "zh-TW": zhMap }
    cacheTimestamp = now

    return NextResponse.json(
      {
        audioMap: {
          en: enMap,
          "zh-TW": zhMap,
          ...enMap,
        },
        cached: false,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      }
    )
  } catch (error: any) {
    console.error("Failed to resolve Rosary audio map from Filebase:", error)
    if (cachedRosaryAudio) {
      return NextResponse.json(
        {
          audioMap: {
            en: cachedRosaryAudio.en,
            "zh-TW": cachedRosaryAudio["zh-TW"],
            ...cachedRosaryAudio.en,
          },
          stale: true,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60",
          },
        }
      )
    }
    return NextResponse.json(
      {
        audioMap: {
          en: DEFAULT_ROSARY_AUDIO_MAP.en,
          "zh-TW": DEFAULT_ROSARY_AUDIO_MAP["zh-TW"],
          ...DEFAULT_ROSARY_AUDIO_MAP.en,
        },
        fallback: true,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60",
        },
      }
    )
  }
}

import { NextResponse } from "next/server"

const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_HANDLE = "@mcgutm5385"
const CHANNEL_ID = "UCtxGo1fut2c0lyYkdo5KWVQ"

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        {
          error: "YouTube API key is not configured",
          channelHandle: CHANNEL_HANDLE,
          channelId: CHANNEL_ID,
          channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
        },
        { status: 200 }
      )
    }

    // Default derived uploads playlist ID (replace UC with UU)
    let uploadsPlaylistId = `UUtxGo1fut2c0lyYkdo5KWVQ`

    // 1. Query the channel using its handle
    try {
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(
          CHANNEL_HANDLE
        )}&key=${API_KEY}`,
        {
          next: { revalidate: 3600 },
        }
      )

      if (channelResponse.ok) {
        const channelData = await channelResponse.json()
        if (channelData.items?.length) {
          uploadsPlaylistId =
            channelData.items[0].contentDetails?.relatedPlaylists?.uploads ||
            uploadsPlaylistId
        }
      }
    } catch (channelErr) {
      console.warn("YouTube channel lookup notice:", channelErr)
    }

    // 2. Get the latest uploaded video from the playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${API_KEY}`,
      {
        next: { revalidate: 3600 },
      }
    )

    const videosData = await videosResponse.json()

    if (!videosResponse.ok || !videosData.items?.length) {
      console.error("YouTube videos lookup failed:", videosData)

      return NextResponse.json(
        {
          error: "No videos found",
          channelHandle: CHANNEL_HANDLE,
          channelId: CHANNEL_ID,
          channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
        },
        { status: 200 }
      )
    }

    const video = videosData.items[0]

    return NextResponse.json({
      videoId: video.snippet.resourceId.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail:
        video.snippet.thumbnails?.maxres?.url ||
        video.snippet.thumbnails?.high?.url ||
        video.snippet.thumbnails?.medium?.url ||
        video.snippet.thumbnails?.default?.url,
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle || "MCG UTM",
      channelHandle: CHANNEL_HANDLE,
      channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
    })
  } catch (error: any) {
    console.error("YouTube API error:", error)

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch latest YouTube video",
        channelHandle: CHANNEL_HANDLE,
        channelId: CHANNEL_ID,
        channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
      },
      { status: 500 }
    )
  }
}

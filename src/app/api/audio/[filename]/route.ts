import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from "stream"

const s3 = new S3Client({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.io",
  region: "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY!,
  },
})

export async function GET(
  req: NextRequest,
  { params }: { params?: Promise<{ filename?: string }> } = {}
) {
  try {
    const resolvedParams = params ? await params : undefined
    const rawFilename =
      resolvedParams?.filename ||
      req.nextUrl.searchParams.get("filename")

    if (!rawFilename) {
      return NextResponse.json(
        { error: "Filename is required." },
        { status: 400 }
      )
    }

    let decodedFilename = rawFilename
    try {
      decodedFilename = decodeURIComponent(rawFilename)
    } catch {
      decodedFilename = rawFilename
    }

    const range = req.headers.get("range")

    const command = new GetObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET || "taize-audio",
      Key: decodedFilename,
      Range: range || undefined,
    })

    const s3Response = await s3.send(command)

    const headers = new Headers()
    headers.set("Content-Type", s3Response.ContentType || "audio/mpeg")
    headers.set("Accept-Ranges", "bytes")
    headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=2592000, immutable")

    if (s3Response.ContentLength !== undefined) {
      headers.set("Content-Length", s3Response.ContentLength.toString())
    }
    if (s3Response.ContentRange) {
      headers.set("Content-Range", s3Response.ContentRange)
    }

    const stream = s3Response.Body
      ? (s3Response.Body as any).transformToWebStream
        ? (s3Response.Body as any).transformToWebStream()
        : Readable.toWeb(s3Response.Body as Readable)
      : null

    if (!stream) {
      return NextResponse.json(
        { error: "Empty audio stream" },
        { status: 404 }
      )
    }

    return new Response(stream, {
      status: range && s3Response.ContentRange ? 206 : 200,
      headers,
    })
  } catch (error: any) {
    console.error("Filebase audio error:", error)

    return NextResponse.json(
      { error: error?.message || "Unable to access audio file." },
      { status: 500 }
    )
  }
}

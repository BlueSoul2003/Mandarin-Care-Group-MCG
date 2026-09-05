import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from "stream"
import { filebaseS3, FILEBASE_BUCKET } from "@/lib/filebase"

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
      Bucket: FILEBASE_BUCKET,
      Key: decodedFilename,
      Range: range || undefined,
    })

    const s3Response = await filebaseS3.send(command)

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
  } catch (error: unknown) {
    const errorName = getS3ErrorName(error)
    console.error("Filebase audio error:", {
      name: errorName,
      message: error instanceof Error ? error.message : "Unknown error",
    })

    if (error instanceof FilebaseConfigurationError) {
      return NextResponse.json(
        {
          error: "Audio storage is not configured.",
          code: "FILEBASE_CONFIGURATION_ERROR",
        },
        { status: 503 }
      )
    }

    if (errorName === "NoSuchKey" || errorName === "NotFound") {
      return NextResponse.json(
        { error: "Audio file not found.", code: "AUDIO_NOT_FOUND" },
        { status: 404 }
      )
    }

    const accessDenied =
      errorName === "AccessDenied" ||
      errorName === "InvalidAccessKeyId" ||
      errorName === "SignatureDoesNotMatch"

    return NextResponse.json(
      {
        error: accessDenied
          ? "Audio storage credentials or bucket access are invalid."
          : "Unable to access audio file.",
        code: accessDenied ? "FILEBASE_ACCESS_DENIED" : "FILEBASE_REQUEST_FAILED",
      },
      { status: 502 }
    )
  }
}

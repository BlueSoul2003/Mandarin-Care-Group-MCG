import { NextRequest, NextResponse } from "next/server"

const requestLog = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const RATE_LIMIT_MAX = 10

function isRateLimited(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-for")
  const key = forwarded?.split(",")[0]?.trim() || "local"
  const now = Date.now()
  const recent = (requestLog.get(key) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    return true
  }

  requestLog.set(key, [...recent, now])
  return false
}

export async function POST(req: NextRequest) {
  try {
    const webhookUrl = process.env.GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Google Sheets Savings Webhook is not configured." },
        { status: 500 }
      )
    }

    if (isRateLimited(req)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      )
    }

    let body: { name?: unknown; week?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const week = typeof body.week === "string" ? body.week.trim().toUpperCase() : ""

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Please provide a valid name (at least 2 characters)." },
        { status: 400 }
      )
    }

    if (!/^W\d+$/i.test(week)) {
      return NextResponse.json(
        { error: "Invalid week format. Expected format like 'W11'." },
        { status: 400 }
      )
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, week }),
      redirect: "follow",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Google Sheets service responded with an error." },
        { status: 502 }
      )
    }

    const result = await response.json()
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[Savings API POST Error]:", error)
    return NextResponse.json(
      { error: "Failed to record savings due to an internal error." },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const webhookUrl = process.env.GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Google Sheets Savings Webhook is not configured." },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(req.url)
    const name = searchParams.get("name")?.trim()

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "A valid name query parameter is required." },
        { status: 400 }
      )
    }

    const queryUrl = `${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}name=${encodeURIComponent(name)}`
    const response = await fetch(queryUrl, {
      method: "GET",
      redirect: "follow",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Google Sheets service responded with an error." },
        { status: 502 }
      )
    }

    const result = await response.json()
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[Savings API GET Error]:", error)
    return NextResponse.json(
      { error: "Failed to fetch savings progress." },
      { status: 500 }
    )
  }
}

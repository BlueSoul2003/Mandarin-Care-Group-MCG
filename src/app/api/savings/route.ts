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

    let body: { name?: unknown; week?: unknown; weekLabel?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const rawWeek = typeof body.week === "string" ? body.week.trim() : ""
    const weekLabel = typeof body.weekLabel === "string" ? body.weekLabel.trim() : ""

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Please provide a valid name (at least 2 characters)." },
        { status: 400 }
      )
    }

    const weekMatch = rawWeek.match(/^W\d+/i)
    if (!weekMatch) {
      return NextResponse.json(
        { error: "Invalid week format. Expected format like 'W11'." },
        { status: 400 }
      )
    }
    const week = weekMatch[0].toUpperCase()

    const payload: { name: string; week: string; weekLabel?: string } = { name, week }
    if (weekLabel) {
      payload.weekLabel = weekLabel
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Google Sheets service responded with an error." },
        { status: 502 }
      )
    }

    const result = await response.json()
    if (result && result.success === false) {
      return NextResponse.json(
        { error: result.error || "Failed to record savings in Google Sheets." },
        { status: 400 }
      )
    }

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
    const action = searchParams.get("action")?.trim()

    if (action !== "weeks" && (!name || name.length < 2)) {
      return NextResponse.json(
        { error: "A valid name query parameter is required." },
        { status: 400 }
      )
    }

    const queryUrl = name
      ? `${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}name=${encodeURIComponent(name)}`
      : webhookUrl

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

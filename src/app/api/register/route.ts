import { NextRequest, NextResponse } from "next/server"
import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const REGISTRATION_DATA_SOURCE_ID = process.env.NOTION_REGISTRATION_DATA_SOURCE_ID

const requestLog = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5

interface RegistrationPayload {
  name: string
  email: string
  phone: string
  majorYear: string
  message: string
  consent: boolean
  website: string
}

function parseRegistration(value: unknown): RegistrationPayload | null {
  if (!value || typeof value !== "object") return null
  const input = value as Record<string, unknown>
  const text = (key: string, max: number) => {
    const field = input[key]
    return typeof field === "string" ? field.trim().slice(0, max) : ""
  }

  const payload = {
    name: text("name", 100),
    email: text("email", 200).toLowerCase(),
    phone: text("phone", 50),
    majorYear: text("majorYear", 100),
    message: text("message", 1000),
    consent: input.consent === true,
    website: text("website", 200),
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
  return payload.name && validEmail && payload.consent ? payload : null
}

function isRateLimited(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")
  const key = forwarded?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  const recent = (requestLog.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )

  if (recent.length >= RATE_LIMIT_MAX) return true
  requestLog.set(key, [...recent, now])
  return false
}

export async function POST(req: NextRequest) {
  try {
    if (!REGISTRATION_DATA_SOURCE_ID || !process.env.NOTION_API_KEY) {
      return NextResponse.json({ error: "Registration database not configured." }, { status: 500 })
    }

    if (isRateLimited(req)) {
      return NextResponse.json({ error: "提交次數過多，請稍後再試。" }, { status: 429 })
    }

    const payload = parseRegistration(await req.json())
    if (!payload) {
      return NextResponse.json({ error: "請確認姓名、email 與資料使用同意。" }, { status: 400 })
    }

    // Honeypot fields are invisible to people but commonly filled by bots.
    if (payload.website) return NextResponse.json({ success: true })

    await notion.pages.create({
      parent: {
        type: "data_source_id",
        data_source_id: REGISTRATION_DATA_SOURCE_ID,
      },
      properties: {
        Name: {
          type: "title",
          title: [{ type: "text", text: { content: payload.name } }],
        },
        Email: {
          type: "email",
          email: payload.email,
        },
        Phone: {
          type: "phone_number",
          phone_number: payload.phone || null,
        },
        MajorYear: {
          type: "rich_text",
          rich_text: payload.majorYear
            ? [{ type: "text", text: { content: payload.majorYear } }]
            : [],
        },
        Message: {
          type: "rich_text",
          rich_text: payload.message
            ? [{ type: "text", text: { content: payload.message } }]
            : [],
        },
        Consent: {
          type: "checkbox",
          checkbox: true,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[Register API Error]", error)
    return NextResponse.json({ error: "Failed to submit registration." }, { status: 500 })
  }
}

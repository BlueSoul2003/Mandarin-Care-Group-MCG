import { NextRequest, NextResponse } from "next/server"
import { Client, type CreatePageParameters } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const REGISTRATION_DATA_SOURCE_ID = process.env.NOTION_REGISTRATION_DATA_SOURCE_ID

const requestLog = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5

interface RegistrationPayload {
  name: string
  email: string
  phone: string
  birthday: string
  majorYear: string
  faithStatus?: string
  sacraments?: string[]
  parishServices?: string[]
  parishServiceOther?: string
  gifts?: string[]
  giftOther?: string
  expectations?: string[]
  expectationOther?: string
  activities?: string[]
  activityOther?: string
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
  const stringList = (key: string, maxItems: number, maxItemLen: number) => {
    const arr = input[key]
    if (!Array.isArray(arr)) return []
    return arr
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().slice(0, maxItemLen))
      .filter(Boolean)
      .slice(0, maxItems)
  }

  const payload = {
    name: text("name", 100),
    email: text("email", 200).toLowerCase(),
    phone: text("phone", 50),
    birthday: text("birthday", 20),
    majorYear: text("majorYear", 100),
    faithStatus: text("faithStatus", 200),
    sacraments: stringList("sacraments", 10, 100),
    parishServices: stringList("parishServices", 20, 100),
    parishServiceOther: text("parishServiceOther", 200),
    gifts: stringList("gifts", 20, 100),
    giftOther: text("giftOther", 200),
    expectations: stringList("expectations", 20, 100),
    expectationOther: text("expectationOther", 200),
    activities: stringList("activities", 20, 100),
    activityOther: text("activityOther", 200),
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
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const payload = parseRegistration(await req.json())
    if (!payload) {
      return NextResponse.json({ error: "Please provide your name, valid email, and consent." }, { status: 400 })
    }

    // Honeypot fields are invisible to people but commonly filled by bots.
    if (payload.website) return NextResponse.json({ success: true })

    const sacramentsList = (payload.sacraments || []).join(", ")
    const parishServiceList = [
      ...(payload.parishServices || []),
      payload.parishServiceOther ? `Other: ${payload.parishServiceOther}` : "",
    ]
      .filter(Boolean)
      .join(", ")
    const giftsList = [
      ...(payload.gifts || []),
      payload.giftOther ? `Other: ${payload.giftOther}` : "",
    ]
      .filter(Boolean)
      .join(", ")
    const expectationsList = [
      ...(payload.expectations || []),
      payload.expectationOther ? `Other: ${payload.expectationOther}` : "",
    ]
      .filter(Boolean)
      .join(", ")
    const activitiesList = [
      ...(payload.activities || []),
      payload.activityOther ? `Other: ${payload.activityOther}` : "",
    ]
      .filter(Boolean)
      .join(", ")

    const formattedMessage = [
      payload.faithStatus ? `[Faith Background: ${payload.faithStatus}]` : "",
      sacramentsList ? `[Sacraments Received: ${sacramentsList}]` : "",
      parishServiceList ? `[Past Parish Service: ${parishServiceList}]` : "",
      giftsList ? `[Gifts & Skills to Share: ${giftsList}]` : "",
      expectationsList ? `[Expectations from MCG: ${expectationsList}]` : "",
      activitiesList ? `[Interested Activities: ${activitiesList}]` : "",
      payload.birthday ? `[Date of Birth: ${payload.birthday}]` : "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n")
      .trim()

    const detailedMessage = [
      sacramentsList ? `[Sacraments Received: ${sacramentsList}]` : "",
      parishServiceList ? `[Past Parish Service: ${parishServiceList}]` : "",
      giftsList ? `[Gifts & Skills to Share: ${giftsList}]` : "",
      expectationsList ? `[Expectations from MCG: ${expectationsList}]` : "",
      activitiesList ? `[Interested Activities: ${activitiesList}]` : "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n")
      .trim()

    const messageWithBirthday = [
      sacramentsList ? `[Sacraments Received: ${sacramentsList}]` : "",
      parishServiceList ? `[Past Parish Service: ${parishServiceList}]` : "",
      giftsList ? `[Gifts & Skills to Share: ${giftsList}]` : "",
      expectationsList ? `[Expectations from MCG: ${expectationsList}]` : "",
      activitiesList ? `[Interested Activities: ${activitiesList}]` : "",
      payload.birthday ? `[Date of Birth: ${payload.birthday}]` : "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n")
      .trim()

    // Step 1: Try with all dedicated Notion columns
    try {
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
          ...(payload.birthday
            ? {
                Birthday: {
                  type: "date" as const,
                  date: { start: payload.birthday },
                },
              }
            : {}),
          ...(payload.faithStatus
            ? {
                FaithStatus: {
                  type: "rich_text" as const,
                  rich_text: [{ type: "text" as const, text: { content: payload.faithStatus } }],
                },
              }
            : {}),
          ...(sacramentsList
            ? {
                Sacraments: {
                  type: "rich_text" as const,
                  rich_text: [{ type: "text" as const, text: { content: sacramentsList } }],
                },
              }
            : {}),
          ...(parishServiceList
            ? {
                ParishServices: {
                  type: "rich_text" as const,
                  rich_text: [{ type: "text" as const, text: { content: parishServiceList } }],
                },
              }
            : {}),
          ...(giftsList
            ? {
                Gifts: {
                  type: "rich_text" as const,
                  rich_text: [{ type: "text" as const, text: { content: giftsList } }],
                },
              }
            : {}),
          ...(expectationsList
            ? {
                Expectations: {
                  type: "rich_text" as const,
                  rich_text: [{ type: "text" as const, text: { content: expectationsList } }],
                },
              }
            : {}),
          ...(activitiesList
            ? {
                Activities: {
                  type: "rich_text" as const,
                  rich_text: [{ type: "text" as const, text: { content: activitiesList } }],
                },
              }
            : {}),
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
    } catch (firstErr) {
      console.warn("[Notion attempt 1 with dedicated columns failed, trying fallback]:", firstErr)

      try {
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
            ...(payload.faithStatus
              ? {
                  FaithStatus: {
                    type: "rich_text" as const,
                    rich_text: [{ type: "text" as const, text: { content: payload.faithStatus } }],
                  },
                }
              : {}),
            MajorYear: {
              type: "rich_text",
              rich_text: payload.majorYear
                ? [{ type: "text", text: { content: payload.majorYear } }]
                : [],
            },
            Message: {
              type: "rich_text",
              rich_text: messageWithBirthday
                ? [{ type: "text", text: { content: messageWithBirthday } }]
                : [],
            },
            Consent: {
              type: "checkbox",
              checkbox: true,
            },
          },
        })
      } catch (secondErr) {
        // Step 3: Try lowercase 'faithstatus' if FaithStatus was not recognized
        console.warn("[Notion attempt 2 failed, retrying with lowercase faithstatus]:", secondErr)
        try {
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
              ...(payload.faithStatus
                ? {
                    faithstatus: {
                      type: "rich_text" as const,
                      rich_text: [{ type: "text" as const, text: { content: payload.faithStatus } }],
                    },
                  }
                : {}),
              MajorYear: {
                type: "rich_text",
                rich_text: payload.majorYear
                  ? [{ type: "text", text: { content: payload.majorYear } }]
                  : [],
              },
              Message: {
                type: "rich_text",
                rich_text: messageWithBirthday
                  ? [{ type: "text", text: { content: messageWithBirthday } }]
                  : [],
              },
              Consent: {
                type: "checkbox",
                checkbox: true,
              },
            },
          })
        } catch (finalErr) {
          // Final fallback: append everything to Message so registration is never lost
          console.warn("[Notion all property attempts failed, using Message fallback]:", finalErr)
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
                rich_text: formattedMessage
                  ? [{ type: "text", text: { content: formattedMessage } }]
                  : [],
              },
              Consent: {
                type: "checkbox",
                checkbox: true,
              },
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[Register API Error]", error)
    return NextResponse.json({ error: "Failed to submit registration." }, { status: 500 })
  }
}

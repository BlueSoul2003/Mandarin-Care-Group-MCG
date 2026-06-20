import { NextRequest, NextResponse } from "next/server"
import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const REGISTRATION_DB_ID = process.env.NOTION_REGISTRATION_DB_ID

export async function POST(req: NextRequest) {
  try {
    if (!REGISTRATION_DB_ID) {
      return NextResponse.json({ error: "Registration database not configured." }, { status: 500 })
    }

    const { name, email, phone, majorYear, message } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 })
    }

    await notion.pages.create({
      parent: { database_id: REGISTRATION_DB_ID },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        Email: {
          email: email,
        },
        Phone: {
          phone_number: phone || "",
        },
        MajorYear: {
          rich_text: [{ text: { content: majorYear || "" } }],
        },
        Message: {
          rich_text: [{ text: { content: message || "" } }],
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Register API Error]", error)
    return NextResponse.json({ error: "Failed to submit registration." }, { status: 500 })
  }
}

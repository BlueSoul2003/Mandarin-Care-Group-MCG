import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn("[Newsletter]: RESEND_API_KEY is not configured in .env.local")
      return NextResponse.json(
        { success: false, message: "RESEND_API_KEY is not configured" },
        { status: 200 }
      )
    }

    const body = await req.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const name = typeof body.name === "string" ? body.name.trim() : ""

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const resend = new Resend(apiKey)
    const [firstName, ...lastNames] = name.split(" ")
    const lastName = lastNames.join(" ")

    const audienceId = process.env.RESEND_AUDIENCE_ID?.trim()

    let response
    if (audienceId) {
      response = await resend.contacts.create({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        unsubscribed: false,
        audienceId,
      })
    } else {
      // In Resend v4, contacts can be added directly without an audienceId
      response = await resend.contacts.create({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        unsubscribed: false,
      })
    }

    if (response.error) {
      console.warn("[Resend]: Failed to create contact:", response.error)
      return NextResponse.json({ success: false, error: response.error.message }, { status: 200 })
    }

    return NextResponse.json({ success: true, contact: response.data }, { status: 200 })
  } catch (error) {
    console.error("[Newsletter Subscribe Error]:", error)
    // Non-blocking: always return 200 so registration doesn't fail
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

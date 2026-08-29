import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim()

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token is missing. Please log in again." },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const secretKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("URL:", supabaseUrl)
    console.log("Anon key loaded:", !!anonKey)
    console.log("Secret key loaded:", !!secretKey)

    if (!supabaseUrl || !anonKey || !secretKey) {
      return NextResponse.json(
        { error: "Supabase server configuration is incomplete." },
        { status: 500 }
      )
    }

    // Verify the user's access token
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    console.log("Checking user...")

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token)

    console.log("User check result:", userError?.message || "SUCCESS")

    if (userError || !user) {
      console.error("USER VERIFICATION ERROR:", userError)

      return NextResponse.json(
        { error: userError?.message || "Invalid session" },
        { status: 401 }
      )
    }

    console.log("USER VERIFIED:", user.id)

    // Admin client
    const supabaseAdmin = createClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

    console.log("Deleting user...")

    // Actually delete the Auth account
    const { error: adminDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id)

    console.log("Delete result:", adminDeleteError?.message || "SUCCESS")

    if (adminDeleteError) {
      console.error("ADMIN DELETE ERROR:", adminDeleteError)

      return NextResponse.json(
        { error: adminDeleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Account deletion exception:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    )
  }
}
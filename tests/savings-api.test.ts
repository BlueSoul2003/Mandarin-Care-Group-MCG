import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

describe("Savings Tracker API (/api/savings)", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL", "https://script.google.com/macros/s/test-id/exec")
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    global.fetch = originalFetch
  })

  describe("POST /api/savings", () => {
    it("rejects request if name is missing or shorter than 2 characters", async () => {
      const { POST } = await import("../src/app/api/savings/route")
      const req = new NextRequest("http://localhost/api/savings", {
        method: "POST",
        body: JSON.stringify({ name: "A", week: "W11" })
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBeDefined()
    })

    it("rejects request if week format is invalid", async () => {
      const { POST } = await import("../src/app/api/savings/route")
      const req = new NextRequest("http://localhost/api/savings", {
        method: "POST",
        body: JSON.stringify({ name: "Brandon Chan", week: "not-a-week" })
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it("returns 500 when GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL is not configured", async () => {
      vi.stubEnv("GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL", "")
      const { POST } = await import("../src/app/api/savings/route")
      const req = new NextRequest("http://localhost/api/savings", {
        method: "POST",
        body: JSON.stringify({ name: "Brandon Chan", week: "W11" })
      })
      const res = await POST(req)
      expect(res.status).toBe(500)
      const data = await res.json()
      expect(data.error).toContain("configured")
    })

    it("forwards valid submission to Google Apps Script webhook and returns 200", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "Savings recorded" })
      }) as unknown as typeof fetch

      const { POST } = await import("../src/app/api/savings/route")
      const req = new NextRequest("http://localhost/api/savings", {
        method: "POST",
        body: JSON.stringify({ name: "Brandon Chan", week: "W11" })
      })
      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        "https://script.google.com/macros/s/test-id/exec",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Brandon Chan", week: "W11" })
        })
      )
    })
  })

  describe("GET /api/savings", () => {
    it("returns 400 when name query parameter is missing", async () => {
      const { GET } = await import("../src/app/api/savings/route")
      const req = new NextRequest("http://localhost/api/savings")
      const res = await GET(req)
      expect(res.status).toBe(400)
    })

    it("forwards valid query to Google Webhook and returns progress data", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          exists: true,
          name: "Brandon Chan",
          totalWeeksSaved: 5,
          totalSaved: 50,
          savedWeeks: ["W1", "W2", "W5", "W6", "W11"]
        })
      }) as unknown as typeof fetch

      const { GET } = await import("../src/app/api/savings/route")
      const req = new NextRequest("http://localhost/api/savings?name=Brandon+Chan")
      const res = await GET(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.totalSaved).toBe(50)
      expect(data.savedWeeks).toContain("W11")
    })
  })
})

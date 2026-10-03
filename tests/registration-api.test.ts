import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { APIResponseError, APIErrorCode, RequestTimeoutError } from "@notionhq/client"

const api = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock("@notionhq/client", async (original) => ({
  ...await original<typeof import("@notionhq/client")>(),
  Client: class { pages = { create: api.create } },
}))
beforeEach(() => {
  vi.resetModules()
  vi.stubEnv("NOTION_API_KEY", "test")
  vi.stubEnv("NOTION_REGISTRATION_DATA_SOURCE_ID", "registration")
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
})
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.resetAllMocks() })
function request() {
  return new NextRequest("http://localhost/api/register", { method: "POST", body: JSON.stringify({ name: "Student", email: "student@example.com", consent: true }) })
}
describe("registration schema fallback", () => {
  it("does not repeat a possibly committed write after a timeout", async () => {
    api.create.mockRejectedValue(new RequestTimeoutError())
    const { POST } = await import("../src/app/api/register/route")
    expect((await POST(request())).status).toBe(500)
    expect(api.create).toHaveBeenCalledOnce()
  })
  it("still supports older schemas after a confirmed validation rejection", async () => {
    api.create.mockRejectedValueOnce(new APIResponseError({ code: APIErrorCode.ValidationError, message: "Unknown property", status: 400, headers: new Headers(), rawBodyText: "{}", additional_data: undefined, request_id: undefined })).mockResolvedValueOnce({ id: "saved" })
    const { POST } = await import("../src/app/api/register/route")
    expect((await POST(request())).status).toBe(200)
    expect(api.create).toHaveBeenCalledTimes(2)
  })
  it("does not write without consent", async () => {
    const { POST } = await import("../src/app/api/register/route")
    const response = await POST(new NextRequest("http://localhost/api/register", { method: "POST", body: JSON.stringify({ name: "Student", email: "student@example.com", consent: false }) }))
    expect(response.status).toBe(400)
    expect(api.create).not.toHaveBeenCalled()
  })
})

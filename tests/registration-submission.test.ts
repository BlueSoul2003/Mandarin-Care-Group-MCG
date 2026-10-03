import { describe, expect, it, vi } from "vitest"
import { createRegistrationSubmission } from "../src/lib/registration-submission"

describe("registration retry", () => {
  it("does not repeat a confirmed registration when account setup is retried", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"))
    const submit = createRegistrationSubmission(fetcher)
    const signup = vi.fn().mockResolvedValueOnce({ error: "offline" }).mockResolvedValueOnce({ error: null })
    for (let attempt = 0; attempt < 2; attempt++) {
      await submit('{"email":"student@example.com"}')
      await signup()
    }
    expect(fetcher).toHaveBeenCalledOnce()
    expect(signup).toHaveBeenCalledTimes(2)
  })
  it("shares concurrent submissions and allows changed details", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"))
    const submit = createRegistrationSubmission(fetcher)
    await Promise.all([submit("first"), submit("first")])
    expect(fetcher).toHaveBeenCalledOnce()
    await submit("changed")
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it("does not mark rejected registrations as saved", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response('{"error":"invalid"}', { status: 400 })).mockResolvedValueOnce(new Response("{}"))
    const submit = createRegistrationSubmission(fetcher)
    await expect(submit("first")).rejects.toThrow("invalid")
    await submit("first")
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})

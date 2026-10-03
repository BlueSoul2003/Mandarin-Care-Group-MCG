import { describe, expect, it, vi } from "vitest"
import { logoutWithFeedback } from "../src/lib/logout"

describe("logout feedback", () => {
  it.each(["returned", "thrown"])("retains identity and reports a %s service failure", async (mode) => {
    const error = new Error("offline")
    const auth = { signOut: mode === "returned" ? vi.fn().mockResolvedValue({ error }) : vi.fn().mockRejectedValue(error) }
    let identity: string | null = "member"
    const failed = vi.fn()
    await logoutWithFeedback(auth, () => { identity = null }, failed)
    expect(identity).toBe("member")
    expect(failed).toHaveBeenCalledOnce()
  })
  it("clears identity only on success, including retry after failure", async () => {
    const auth = { signOut: vi.fn().mockResolvedValueOnce({ error: new Error("offline") }).mockResolvedValueOnce({ error: null }) }
    const clear = vi.fn(), failed = vi.fn()
    await logoutWithFeedback(auth, clear, failed)
    expect(clear).not.toHaveBeenCalled()
    await logoutWithFeedback(auth, clear, failed)
    expect(clear).toHaveBeenCalledOnce()
  })
})

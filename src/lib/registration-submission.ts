// Retain confirmed submissions only for the lifetime of this form. Passwords
// are never part of this payload or written to browser storage.
export function createRegistrationSubmission(fetcher: typeof fetch = fetch) {
  const submitted = new Set<string>()
  const pending = new Map<string, Promise<void>>()
  return async (body: string): Promise<void> => {
    if (submitted.has(body)) return
    const existing = pending.get(body)
    if (existing) return existing
    const request = (async () => {
      const response = await fetcher("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body,
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(typeof data.error === "string" ? data.error : "Failed to submit registration.")
      }
      submitted.add(body)
    })()
    pending.set(body, request)
    try { await request } finally { pending.delete(body) }
  }
}

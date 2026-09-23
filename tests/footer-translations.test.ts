import { describe, expect, it } from "vitest"
import enMessages from "../messages/en.json"
import zhMessages from "../messages/zh-TW.json"

describe("Footer localization", () => {
  it("has all required Footer translation keys in en.json and zh-TW.json", () => {
    const requiredKeys = [
      "desc",
      "events",
      "articles",
      "committee",
      "footerNavigation",
      "scripture",
      "scriptureRef",
      "invitationTitle",
      "invitationDesc",
      "joinCommunity",
      "communityCol",
      "spiritualCol",
      "fellowshipCol",
      "lifestyle",
      "gallery",
      "series",
      "spiritual",
      "rosary",
      "taize",
      "profile",
      "login",
      "contactUs",
      "campusLocation",
      "diocese",
      "youtubeChannel",
      "youtubeSub",
      "backToTop",
      "allRightsReserved",
      "amdg",
    ] as const

    const enFooter = (enMessages as unknown as Record<string, Record<string, string>>).Footer
    const zhFooter = (zhMessages as unknown as Record<string, Record<string, string>>).Footer

    for (const key of requiredKeys) {
      expect(enFooter[key], `Missing en.json key: ${key}`).toBeDefined()
      expect(enFooter[key].length, `Empty en.json key: ${key}`).toBeGreaterThan(0)

      expect(zhFooter[key], `Missing zh-TW.json key: ${key}`).toBeDefined()
      expect(zhFooter[key].length, `Empty zh-TW.json key: ${key}`).toBeGreaterThan(0)
    }
  })
})

import { describe, expect, it } from "vitest"
import { getCatholicEventsForYear } from "../src/data/catholic-events"

describe("catholic-events", () => {
  it("calculates correct movable and fixed feasts for 2024", () => {
    const events = getCatholicEventsForYear(2024)
    const findByTitle = (en: string) => events.find((e) => e.title.en.startsWith(en))

    expect(findByTitle("Easter Sunday")?.startDate).toBe("2024-03-31")
    expect(findByTitle("Ash Wednesday")?.startDate).toBe("2024-02-14")
    expect(findByTitle("Palm Sunday")?.startDate).toBe("2024-03-24")
    expect(findByTitle("Holy Thursday")?.startDate).toBe("2024-03-28")
    expect(findByTitle("Good Friday")?.startDate).toBe("2024-03-29")
    expect(findByTitle("Holy Saturday")?.startDate).toBe("2024-03-30")
    expect(findByTitle("Ascension of the Lord")?.startDate).toBe("2024-05-09")
    expect(findByTitle("Assumption")?.startDate).toBe("2024-08-15")
    expect(findByTitle("All Saints")?.startDate).toBe("2024-11-01")
    expect(findByTitle("All Souls")?.startDate).toBe("2024-11-02")
    expect(findByTitle("Christmas")?.startDate).toBe("2024-12-25")
  })

  it("calculates correct movable and fixed feasts for 2026", () => {
    const events = getCatholicEventsForYear(2026)
    const findByTitle = (en: string) => events.find((e) => e.title.en.startsWith(en))

    expect(findByTitle("Easter Sunday")?.startDate).toBe("2026-04-05")
    expect(findByTitle("Ash Wednesday")?.startDate).toBe("2026-02-18")
    expect(findByTitle("Good Friday")?.startDate).toBe("2026-04-03")
    expect(findByTitle("Ascension of the Lord")?.startDate).toBe("2026-05-14")
    expect(findByTitle("Assumption")?.startDate).toBe("2026-08-15")
    expect(findByTitle("All Saints")?.startDate).toBe("2026-11-01")
    expect(findByTitle("All Souls")?.startDate).toBe("2026-11-02")
    expect(findByTitle("Christmas")?.startDate).toBe("2026-12-25")
  })
})

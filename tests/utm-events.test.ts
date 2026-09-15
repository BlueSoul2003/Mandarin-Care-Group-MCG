import { describe, expect, it } from "vitest"
import { UTM_ACADEMIC_EVENTS, getUtmEventsForYear, getUtmEventsForYears } from "../src/data/utm-events"

describe("utm-events", () => {
  it("contains all 17 UTM academic calendar events", () => {
    expect(UTM_ACADEMIC_EVENTS).toHaveLength(17)
  })

  it("filters 2026 UTM events correctly", () => {
    const events2026 = getUtmEventsForYear(2026)
    expect(events2026.length).toBe(6)

    const findByTitle = (en: string) => events2026.find((e) => e.title.en === en)
    expect(findByTitle("Local Undergraduate Registration")?.startDate).toBe("2026-10-04")
    expect(findByTitle("Student Orientation Week (Minggu Mesra Mahasiswa)")?.startDate).toBe("2026-10-04")
    expect(findByTitle("Semester I")?.startDate).toBe("2026-10-12")
    expect(findByTitle("Lectures Semester I (First Half)")?.startDate).toBe("2026-10-12")
    expect(findByTitle("Mid-Semester Break")?.startDate).toBe("2026-11-30")
    expect(findByTitle("Lectures Semester I (Second Half)")?.startDate).toBe("2026-12-07")
  })

  it("filters 2027 UTM events correctly", () => {
    const events2027 = getUtmEventsForYear(2027)
    expect(events2027.length).toBe(11)

    const findByTitle = (en: string) => events2027.find((e) => e.title.en === en)
    expect(findByTitle("Revision Period Semester I")?.startDate).toBe("2027-01-25")
    expect(findByTitle("Final Examination Semester I")?.startDate).toBe("2027-01-31")
    expect(findByTitle("Final Break Semester I")?.startDate).toBe("2027-02-20")
    expect(findByTitle("Local Undergraduate Registration")?.startDate).toBe("2027-03-21")
    expect(findByTitle("Semester II")?.startDate).toBe("2027-03-22")
    expect(findByTitle("Lectures Semester II (First Half)")?.startDate).toBe("2027-03-22")
    expect(findByTitle("Mid-Semester Break")?.startDate).toBe("2027-05-17")
    expect(findByTitle("Lectures Semester II (Second Half)")?.startDate).toBe("2027-05-24")
    expect(findByTitle("Revision Period Semester II")?.startDate).toBe("2027-07-05")
    expect(findByTitle("Final Examination Semester II")?.startDate).toBe("2027-07-12")
    expect(findByTitle("Final Break Semester II")?.startDate).toBe("2027-07-26")
  })

  it("retrieves events for multiple years", () => {
    const events = getUtmEventsForYears([2026, 2027])
    expect(events).toHaveLength(17)
  })
})

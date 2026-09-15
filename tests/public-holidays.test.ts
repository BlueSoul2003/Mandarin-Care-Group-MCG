import { describe, expect, it } from "vitest"
import {
  PUBLIC_HOLIDAYS,
  getPublicHolidaysForYear,
  getPublicHolidaysForYears,
} from "../src/data/public-holidays"

describe("public-holidays", () => {
  it("contains all 19 public holiday items", () => {
    expect(PUBLIC_HOLIDAYS).toHaveLength(19)
  })

  it("filters 2026 public holidays correctly", () => {
    const holidays2026 = getPublicHolidaysForYear(2026)
    expect(holidays2026).toHaveLength(2)

    const findByTitle = (en: string) => holidays2026.find((h) => h.title.en === en)
    expect(findByTitle("Deepavali")?.startDate).toBe("2026-11-08")
    expect(findByTitle("Christmas Day")?.startDate).toBe("2026-12-25")
  })

  it("filters 2027 public holidays correctly", () => {
    const holidays2027 = getPublicHolidaysForYear(2027)
    expect(holidays2027).toHaveLength(17)

    const findByTitle = (en: string) => holidays2027.find((h) => h.title.en === en)
    expect(findByTitle("New Year's Day (KL only)")?.startDate).toBe("2027-01-01")
    expect(findByTitle("Thaipusam (Johor only)")?.startDate).toBe("2027-01-22")
    expect(findByTitle("Federal Territory Day (KL only)")?.startDate).toBe("2027-02-01")
    expect(findByTitle("Chinese New Year")?.startDate).toBe("2027-02-06")
    expect(findByTitle("Awal Ramadhan (Johor only)")?.startDate).toBe("2027-02-08")
    expect(findByTitle("Nuzul Al-Quran (KL only)")?.startDate).toBe("2027-02-24")
    expect(findByTitle("Eidul Fitri (Hari Raya Aidilfitri)")?.startDate).toBe("2027-03-10")
    expect(findByTitle("Sultan Johor's Birthday (Johor only)")?.startDate).toBe("2027-03-23")
    expect(findByTitle("Labour Day")?.startDate).toBe("2027-05-01")
    expect(findByTitle("Eidul Adha (Hari Raya Haji)")?.startDate).toBe("2027-05-17")
    expect(findByTitle("Wesak Day")?.startDate).toBe("2027-05-20")
    expect(findByTitle("Awal Muharram (Johor only)")?.startDate).toBe("2027-06-06")
    expect(findByTitle("YDP Agong's Birthday")?.startDate).toBe("2027-06-07")
    expect(findByTitle("Hol Almarhum Sultan Iskandar (Johor only)")?.startDate).toBe("2027-07-10")
    expect(findByTitle("Prophet Muhammad's Birthday (Maulidur Rasul)")?.startDate).toBe("2027-08-15")
    expect(findByTitle("Merdeka Day (National Day)")?.startDate).toBe("2027-08-31")
    expect(findByTitle("Malaysia Day")?.startDate).toBe("2027-09-16")
  })

  it("filters holidays across multiple years", () => {
    const holidays = getPublicHolidaysForYears([2026, 2027])
    expect(holidays).toHaveLength(19)
  })
})

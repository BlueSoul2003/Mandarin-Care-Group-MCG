export interface UtmEventItem {
  id: string
  isUtm: true
  slug?: string
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  dateLabel: {
    en: string
    "zh-TW": string
  }
  title: {
    en: string
    "zh-TW": string
  }
  summary: {
    en: string
    "zh-TW": string
  }
}

/**
 * Hardcoded UTM Academic Calendar dates for Session 2026/2027.
 */
export const UTM_ACADEMIC_EVENTS: UtmEventItem[] = [
  // 1. Local Undergraduate Registration - 4 October 2026
  {
    id: "utm-2026-local-undergraduate-registration-sem1",
    isUtm: true,
    startDate: "2026-10-04",
    endDate: "2026-10-04",
    dateLabel: {
      en: "4 October 2026",
      "zh-TW": "2026年10月4日",
    },
    title: {
      en: "Local Undergraduate Registration",
      "zh-TW": "本地學士新生註冊",
    },
    summary: {
      en: "Official registration day for new local undergraduate students at Universiti Teknologi Malaysia (UTM).",
      "zh-TW": "馬來西亞工藝大學（UTM）本地學士學位新生入學註冊日。",
    },
  },
  // 2. Student Orientation Week (Minggu Mesra Mahasiswa) - 4–9 October 2026
  {
    id: "utm-2026-orientation-week",
    isUtm: true,
    startDate: "2026-10-04",
    endDate: "2026-10-09",
    dateLabel: {
      en: "4–9 October 2026",
      "zh-TW": "2026年10月4日–9日",
    },
    title: {
      en: "Student Orientation Week (Minggu Mesra Mahasiswa)",
      "zh-TW": "新生迎新週（Minggu Mesra Mahasiswa）",
    },
    summary: {
      en: "Orientation week introducing newly admitted students to campus life, faculty resources, and university culture.",
      "zh-TW": "馬來西亞工藝大學為全體新生舉辦的迎新導向週（Minggu Mesra Mahasiswa），協助熟悉校園與各項學術資源。",
    },
  },
  // 3. Semester I - 12 October 2026 – 21 March 2027
  {
    id: "utm-2026-semester-1-overall",
    isUtm: true,
    startDate: "2026-10-12",
    endDate: "2027-03-21",
    dateLabel: {
      en: "12 October 2026 – 21 March 2027",
      "zh-TW": "2026年10月12日 – 2027年3月21日",
    },
    title: {
      en: "Semester I",
      "zh-TW": "第一學期（Semester I）",
    },
    summary: {
      en: "Official duration of Academic Session 2026/2027 Semester I (including lectures, mid-semester break, revision period, and examinations).",
      "zh-TW": "2026/2027 學年度第一學期完整期程（包含課堂授課、期中假期、溫習週及期末考試）。",
    },
  },
  // 4. Lectures Semester I (First Half) - 12 October – 29 November 2026
  {
    id: "utm-2026-lectures-sem1-first-half",
    isUtm: true,
    startDate: "2026-10-12",
    endDate: "2026-11-29",
    dateLabel: {
      en: "12 October – 29 November 2026",
      "zh-TW": "2026年10月12日 – 11月29日",
    },
    title: {
      en: "Lectures Semester I (First Half)",
      "zh-TW": "第一學期前半段授課",
    },
    summary: {
      en: "First half of Semester I lecture period prior to the mid-semester break (Weeks 1–7).",
      "zh-TW": "第一學期常規教學與課堂期前半段（期中假前共7週）。",
    },
  },
  // 5. Mid-Semester Break - 30 November – 6 December 2026
  {
    id: "utm-2026-mid-semester-break-sem1",
    isUtm: true,
    startDate: "2026-11-30",
    endDate: "2026-12-06",
    dateLabel: {
      en: "30 November – 6 December 2026",
      "zh-TW": "2026年11月30日 – 12月6日",
    },
    title: {
      en: "Mid-Semester Break",
      "zh-TW": "期中假期（Mid-Semester Break）",
    },
    summary: {
      en: "One-week mid-semester recess for Semester I students and academic staff.",
      "zh-TW": "第一學期為期一週的期中假期與休整週。",
    },
  },
  // 6. Lectures Semester I (Second Half) - 7 December 2026 – 24 January 2027
  {
    id: "utm-2026-lectures-sem1-second-half",
    isUtm: true,
    startDate: "2026-12-07",
    endDate: "2027-01-24",
    dateLabel: {
      en: "7 December 2026 – 24 January 2027",
      "zh-TW": "2026年12月7日 – 2027年1月24日",
    },
    title: {
      en: "Lectures Semester I (Second Half)",
      "zh-TW": "第一學期後半段授課",
    },
    summary: {
      en: "Second half of Semester I lecture period leading to the revision week (Weeks 8–14).",
      "zh-TW": "第一學期常規教學與課堂期後半段（期中假後至溫習週前共7週）。",
    },
  },
  // 7. Revision Period Semester I - 25–30 January 2027
  {
    id: "utm-2027-revision-period-sem1",
    isUtm: true,
    startDate: "2027-01-25",
    endDate: "2027-01-30",
    dateLabel: {
      en: "25–30 January 2027",
      "zh-TW": "2027年1月25日–30日",
    },
    title: {
      en: "Revision Period Semester I",
      "zh-TW": "第一學期溫習週（Revision Period）",
    },
    summary: {
      en: "Dedicated study and preparation period before Semester I final examinations.",
      "zh-TW": "第一學期期末考試前自主溫習與準備週。",
    },
  },
  // 8. Final Examination Semester I - 31 January – 19 February 2027
  {
    id: "utm-2027-final-examination-sem1",
    isUtm: true,
    startDate: "2027-01-31",
    endDate: "2027-02-19",
    dateLabel: {
      en: "31 January – 19 February 2027",
      "zh-TW": "2027年1月31日 – 2月19日",
    },
    title: {
      en: "Final Examination Semester I",
      "zh-TW": "第一學期期末考試（Final Examination）",
    },
    summary: {
      en: "Official final examination period for Semester I courses across all faculties.",
      "zh-TW": "第一學期全校各院系課程期末正式考試期（約3週）。",
    },
  },
  // 9. Final Break Semester I - 20 February – 21 March 2027
  {
    id: "utm-2027-final-break-sem1",
    isUtm: true,
    startDate: "2027-02-20",
    endDate: "2027-03-21",
    dateLabel: {
      en: "20 February – 21 March 2027",
      "zh-TW": "2027年2月20日 – 3月21日",
    },
    title: {
      en: "Final Break Semester I",
      "zh-TW": "第一學期期末假期（學期假）",
    },
    summary: {
      en: "Inter-semester break between Semester I and Semester II (approx. 4 weeks).",
      "zh-TW": "第一學期期末考後至第二學期開學前的學期間長假期（約4週）。",
    },
  },
  // 10. Local Undergraduate Registration - 21 March 2027
  {
    id: "utm-2027-local-undergraduate-registration-sem2",
    isUtm: true,
    startDate: "2027-03-21",
    endDate: "2027-03-21",
    dateLabel: {
      en: "21 March 2027",
      "zh-TW": "2027年3月21日",
    },
    title: {
      en: "Local Undergraduate Registration",
      "zh-TW": "本地學士新生註冊",
    },
    summary: {
      en: "Registration day for new local undergraduate students admitted for Semester II.",
      "zh-TW": "第二學期入學之本地學士學位新生註冊日。",
    },
  },
  // 11. Semester II - 22 March – 3 October 2027
  {
    id: "utm-2027-semester-2-overall",
    isUtm: true,
    startDate: "2027-03-22",
    endDate: "2027-10-03",
    dateLabel: {
      en: "22 March – 3 October 2027",
      "zh-TW": "2027年3月22日 – 10月3日",
    },
    title: {
      en: "Semester II",
      "zh-TW": "第二學期（Semester II）",
    },
    summary: {
      en: "Official duration of Academic Session 2026/2027 Semester II.",
      "zh-TW": "2026/2027 學年度第二學期完整期程（包含授課、期中假、溫習週及期末考）。",
    },
  },
  // 12. Lectures Semester II (First Half) - 22 March – 16 May 2027
  {
    id: "utm-2027-lectures-sem2-first-half",
    isUtm: true,
    startDate: "2027-03-22",
    endDate: "2027-05-16",
    dateLabel: {
      en: "22 March – 16 May 2027",
      "zh-TW": "2027年3月22日 – 5月16日",
    },
    title: {
      en: "Lectures Semester II (First Half)",
      "zh-TW": "第二學期前半段授課",
    },
    summary: {
      en: "First half of Semester II lecture period prior to the mid-semester break (Weeks 1–8).",
      "zh-TW": "第二學期常規教學與課堂期前半段（期中假前共8週）。",
    },
  },
  // 13. Mid-Semester Break - 17–23 May 2027
  {
    id: "utm-2027-mid-semester-break-sem2",
    isUtm: true,
    startDate: "2027-05-17",
    endDate: "2027-05-23",
    dateLabel: {
      en: "17–23 May 2027",
      "zh-TW": "2027年5月17日–23日",
    },
    title: {
      en: "Mid-Semester Break",
      "zh-TW": "期中假期（Mid-Semester Break）",
    },
    summary: {
      en: "One-week mid-semester recess for Semester II students and academic staff.",
      "zh-TW": "第二學期為期一週的期中假期與休整週。",
    },
  },
  // 14. Lectures Semester II (Second Half) - 24 May – 4 July 2027
  {
    id: "utm-2027-lectures-sem2-second-half",
    isUtm: true,
    startDate: "2027-05-24",
    endDate: "2027-07-04",
    dateLabel: {
      en: "24 May – 4 July 2027",
      "zh-TW": "2027年5月24日 – 7月4日",
    },
    title: {
      en: "Lectures Semester II (Second Half)",
      "zh-TW": "第二學期後半段授課",
    },
    summary: {
      en: "Second half of Semester II lecture period leading to revision week (Weeks 9–14).",
      "zh-TW": "第二學期常規教學與課堂期後半段（期中假後至溫習週前共6週）。",
    },
  },
  // 15. Revision Period Semester II - 5–11 July 2027
  {
    id: "utm-2027-revision-period-sem2",
    isUtm: true,
    startDate: "2027-07-05",
    endDate: "2027-07-11",
    dateLabel: {
      en: "5–11 July 2027",
      "zh-TW": "2027年7月5日–11日",
    },
    title: {
      en: "Revision Period Semester II",
      "zh-TW": "第二學期溫習週（Revision Period）",
    },
    summary: {
      en: "Dedicated study and preparation period before Semester II final examinations.",
      "zh-TW": "第二學期期末考試前自主溫習與準備週。",
    },
  },
  // 16. Final Examination Semester II - 12–25 July 2027
  {
    id: "utm-2027-final-examination-sem2",
    isUtm: true,
    startDate: "2027-07-12",
    endDate: "2027-07-25",
    dateLabel: {
      en: "12–25 July 2027",
      "zh-TW": "2027年7月12日–25日",
    },
    title: {
      en: "Final Examination Semester II",
      "zh-TW": "第二學期期末考試（Final Examination）",
    },
    summary: {
      en: "Official final examination period for Semester II courses across all faculties (approx. 2 weeks).",
      "zh-TW": "第二學期全校各院系課程期末正式考試期（約2週）。",
    },
  },
  // 17. Final Break Semester II - 26 July – 3 October 2027
  {
    id: "utm-2027-final-break-sem2",
    isUtm: true,
    startDate: "2027-07-26",
    endDate: "2027-10-03",
    dateLabel: {
      en: "26 July – 3 October 2027",
      "zh-TW": "2027年7月26日 – 10月3日",
    },
    title: {
      en: "Final Break Semester II",
      "zh-TW": "第二學期期末長假（暑假）",
    },
    summary: {
      en: "Long vacation period concluding Academic Session 2026/2027 (approx. 10 weeks).",
      "zh-TW": "2026/2027 學年度第二學期期末長假（暑期長假，約10週）。",
    },
  },
]

/**
 * Filter UTM Academic events for a given calendar year by startDate.
 */
export function getUtmEventsForYear(year: number): UtmEventItem[] {
  const yearStr = year.toString()
  return UTM_ACADEMIC_EVENTS.filter((ev) => ev.startDate.startsWith(yearStr))
}

/**
 * Filter UTM Academic events for multiple years.
 */
export function getUtmEventsForYears(years: number[]): UtmEventItem[] {
  const yearStrings = new Set(years.map((y) => y.toString()))
  return UTM_ACADEMIC_EVENTS.filter((ev) => {
    const yr = ev.startDate.substring(0, 4)
    return yearStrings.has(yr)
  })
}

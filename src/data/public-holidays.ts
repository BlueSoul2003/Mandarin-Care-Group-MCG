export interface PublicHolidayItem {
  id: string
  isHoliday: true
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
 * Public Holidays for 2026 and 2027 (Malaysia, Johor, and Kuala Lumpur).
 */
export const PUBLIC_HOLIDAYS: PublicHolidayItem[] = [
  // 1. Deepavali - 8 & 9 November 2026
  {
    id: "holiday-2026-deepavali",
    isHoliday: true,
    startDate: "2026-11-08",
    endDate: "2026-11-09",
    dateLabel: {
      en: "8 & 9 November 2026",
      "zh-TW": "2026年11月8日–9日",
    },
    title: {
      en: "Deepavali",
      "zh-TW": "屠妖節（Deepavali）",
    },
    summary: {
      en: "Festival of Lights celebrated by the Hindu community, symbolizing the victory of light over darkness and good over evil.",
      "zh-TW": "印度教燈節（屠妖節），象徵光明戰勝黑暗、良善戰勝邪惡的傳統歡慶節日。",
    },
  },
  // 2. Christmas Day - 25 December 2026
  {
    id: "holiday-2026-christmas-day",
    isHoliday: true,
    startDate: "2026-12-25",
    endDate: "2026-12-25",
    dateLabel: {
      en: "25 December 2026",
      "zh-TW": "2026年12月25日",
    },
    title: {
      en: "Christmas Day",
      "zh-TW": "聖誕節（Christmas Day）",
    },
    summary: {
      en: "National public holiday celebrating the birth of Jesus Christ, marked by family gatherings and goodwill.",
      "zh-TW": "紀念主耶穌基督降生的全國法定公眾假期，闔家團聚互道祝福。",
    },
  },
  // 3. New Year's Day (KL only) - 1 January 2027
  {
    id: "holiday-2027-new-years-day",
    isHoliday: true,
    startDate: "2027-01-01",
    endDate: "2027-01-01",
    dateLabel: {
      en: "1 January 2027",
      "zh-TW": "2027年1月1日",
    },
    title: {
      en: "New Year's Day (KL only)",
      "zh-TW": "元旦（僅限吉隆坡）",
    },
    summary: {
      en: "Celebration of the first day of the Gregorian new year (observed in Kuala Lumpur).",
      "zh-TW": "公曆新年首日元旦假期（吉隆坡聯邦直轄區限定公假）。",
    },
  },
  // 4. Thaipusam (Johor only) - 22 January 2027
  {
    id: "holiday-2027-thaipusam",
    isHoliday: true,
    startDate: "2027-01-22",
    endDate: "2027-01-22",
    dateLabel: {
      en: "22 January 2027",
      "zh-TW": "2027年1月22日",
    },
    title: {
      en: "Thaipusam (Johor only)",
      "zh-TW": "大寶森節（僅限柔佛）",
    },
    summary: {
      en: "Tamil Hindu festival celebrated with sacred kavadi processions dedicated to Lord Murugan (state holiday in Johor).",
      "zh-TW": "敬奉穆魯干神的印度教傳統盛節，信徒背負卡瓦第虔敬還願（柔佛州州立公假）。",
    },
  },
  // 5. Federal Territory Day (KL only) - 1 February 2027
  {
    id: "holiday-2027-federal-territory-day",
    isHoliday: true,
    startDate: "2027-02-01",
    endDate: "2027-02-01",
    dateLabel: {
      en: "1 February 2027",
      "zh-TW": "2027年2月1日",
    },
    title: {
      en: "Federal Territory Day (KL only)",
      "zh-TW": "聯邦直轄區日（僅限吉隆坡）",
    },
    summary: {
      en: "Commemorating the establishment of the Federal Territory of Kuala Lumpur in 1974 (observed in KL).",
      "zh-TW": "紀念1974年吉隆坡正式成為聯邦直轄區的法定紀念節日（吉隆坡限定公假）。",
    },
  },
  // 6. Chinese New Year - 6, 7 & 8 February 2027
  {
    id: "holiday-2027-chinese-new-year",
    isHoliday: true,
    startDate: "2027-02-06",
    endDate: "2027-02-08",
    dateLabel: {
      en: "6, 7 & 8 February 2027",
      "zh-TW": "2027年2月6日、7日及8日",
    },
    title: {
      en: "Chinese New Year",
      "zh-TW": "農曆新年（春節）",
    },
    summary: {
      en: "Lunar New Year national holidays celebrating family reunions, auspicious beginnings, and festive traditions.",
      "zh-TW": "農曆春節全國法定連假，象徵迎春納福、萬象更新與闔家團圓。",
    },
  },
  // 7. Awal Ramadhan (Johor only) - 8 February 2027
  {
    id: "holiday-2027-awal-ramadhan",
    isHoliday: true,
    startDate: "2027-02-08",
    endDate: "2027-02-08",
    dateLabel: {
      en: "8 February 2027",
      "zh-TW": "2027年2月8日",
    },
    title: {
      en: "Awal Ramadhan (Johor only)",
      "zh-TW": "齋戒月首日（僅限柔佛）",
    },
    summary: {
      en: "Commencement of the holy month of fasting, reflection, and prayers for Muslims (state holiday in Johor).",
      "zh-TW": "伊斯蘭教聖潔齋戒月開端，展開祈禱與心靈反省（柔佛州州立公假）。",
    },
  },
  // 8. Nuzul Al-Quran (KL only) - 24 February 2027
  {
    id: "holiday-2027-nuzul-al-quran",
    isHoliday: true,
    startDate: "2027-02-24",
    endDate: "2027-02-24",
    dateLabel: {
      en: "24 February 2027",
      "zh-TW": "2027年2月24日",
    },
    title: {
      en: "Nuzul Al-Quran (KL only)",
      "zh-TW": "可蘭經降世日（僅限吉隆坡）",
    },
    summary: {
      en: "Commemorating the night the Holy Quran was first revealed to Prophet Muhammad (observed in Kuala Lumpur).",
      "zh-TW": "紀念先知穆罕默德首次領受可蘭經啟示的聖日（吉隆坡聯邦直轄區限定公假）。",
    },
  },
  // 9. Eidul Fitri - 10 & 11 March 2027
  {
    id: "holiday-2027-eidul-fitri",
    isHoliday: true,
    startDate: "2027-03-10",
    endDate: "2027-03-11",
    dateLabel: {
      en: "10 & 11 March 2027",
      "zh-TW": "2027年3月10日–11日",
    },
    title: {
      en: "Eidul Fitri (Hari Raya Aidilfitri)",
      "zh-TW": "開齋節（Hari Raya Aidilfitri）",
    },
    summary: {
      en: "National public holidays marking the completion of Ramadan with communal prayers, mutual forgiveness, and open houses.",
      "zh-TW": "歡慶齋戒月圓滿成功的伊斯蘭盛節，信徒同心祈禱、彼此寬恕並互訪祝福。",
    },
  },
  // 10. Sultan Johor's Birthday (Johor only) - 23 March 2027
  {
    id: "holiday-2027-sultan-johor-birthday",
    isHoliday: true,
    startDate: "2027-03-23",
    endDate: "2027-03-23",
    dateLabel: {
      en: "23 March 2027",
      "zh-TW": "2027年3月23日",
    },
    title: {
      en: "Sultan Johor's Birthday (Johor only)",
      "zh-TW": "柔佛蘇丹華誕（僅限柔佛）",
    },
    summary: {
      en: "Official birthday celebration of His Majesty the Sultan of Johor (state holiday in Johor).",
      "zh-TW": "柔佛州元首蘇丹殿下官方華誕紀念日（柔佛州公眾假期）。",
    },
  },
  // 11. Labour Day - 1 May 2027
  {
    id: "holiday-2027-labour-day",
    isHoliday: true,
    startDate: "2027-05-01",
    endDate: "2027-05-01",
    dateLabel: {
      en: "1 May 2027",
      "zh-TW": "2027年5月1日",
    },
    title: {
      en: "Labour Day",
      "zh-TW": "勞動節（Labour Day）",
    },
    summary: {
      en: "National holiday celebrating the social and economic contributions of workers nationwide.",
      "zh-TW": "表彰全體辛勤勞工卓越奉獻與社會貢獻的全國法定勞動節假期。",
    },
  },
  // 12. Eidul Adha - 17 May 2027
  {
    id: "holiday-2027-eidul-adha",
    isHoliday: true,
    startDate: "2027-05-17",
    endDate: "2027-05-17",
    dateLabel: {
      en: "17 May 2027",
      "zh-TW": "2027年5月17日",
    },
    title: {
      en: "Eidul Adha (Hari Raya Haji)",
      "zh-TW": "哈芝節 / 宰牲節（Eidul Adha）",
    },
    summary: {
      en: "Feast of Sacrifice honoring devotion and charitable sharing, coinciding with the completion of the Hajj pilgrimage.",
      "zh-TW": "紀念信德與犧牲奉獻精神的宰牲節，亦逢麥加朝覲聖禮圓滿告成之時。",
    },
  },
  // 13. Wesak Day - 20 May 2027
  {
    id: "holiday-2027-wesak-day",
    isHoliday: true,
    startDate: "2027-05-20",
    endDate: "2027-05-20",
    dateLabel: {
      en: "20 May 2027",
      "zh-TW": "2027年5月20日",
    },
    title: {
      en: "Wesak Day",
      "zh-TW": "衛塞節（Wesak Day）",
    },
    summary: {
      en: "Sacred day commemorating the birth, supreme enlightenment, and passing of Gautama Buddha.",
      "zh-TW": "佛教最殊勝尊榮之大日，紀念釋迦牟尼佛誕生、成道與涅槃之恩澤。",
    },
  },
  // 14. Awal Muharram (Johor only) - 6 & 7 June 2027
  {
    id: "holiday-2027-awal-muharram",
    isHoliday: true,
    startDate: "2027-06-06",
    endDate: "2027-06-07",
    dateLabel: {
      en: "6 & 7 June 2027",
      "zh-TW": "2027年6月6日–7日",
    },
    title: {
      en: "Awal Muharram (Johor only)",
      "zh-TW": "伊斯蘭新年（僅限柔佛）",
    },
    summary: {
      en: "Islamic Hijri New Year celebration commencing the month of Muharram (state holiday in Johor).",
      "zh-TW": "伊斯蘭曆希吉拉新年首月首日連假（柔佛州州立公假）。",
    },
  },
  // 15. YDP Agong's Birthday - 7 June 2027
  {
    id: "holiday-2027-ydp-agong-birthday",
    isHoliday: true,
    startDate: "2027-06-07",
    endDate: "2027-06-07",
    dateLabel: {
      en: "7 June 2027",
      "zh-TW": "2027年6月7日",
    },
    title: {
      en: "YDP Agong's Birthday",
      "zh-TW": "國家元首華誕（YDP Agong's Birthday）",
    },
    summary: {
      en: "National celebration honoring the official birthday of His Majesty the Yang di-Pertuan Agong, King of Malaysia.",
      "zh-TW": "慶祝馬來西亞最高元首陛下官方華誕之全國法定公眾假日。",
    },
  },
  // 16. Hol Almarhum Sultan Iskandar (Johor only) - 10 July 2027
  {
    id: "holiday-2027-hol-almarhum-sultan-iskandar",
    isHoliday: true,
    startDate: "2027-07-10",
    endDate: "2027-07-10",
    dateLabel: {
      en: "10 July 2027",
      "zh-TW": "2027年7月10日",
    },
    title: {
      en: "Hol Almarhum Sultan Iskandar (Johor only)",
      "zh-TW": "柔佛已故蘇丹伊斯干達忌日（僅限柔佛）",
    },
    summary: {
      en: "Official memorial and prayer day honoring the late Sultan of Johor, Almarhum Sultan Iskandar (state holiday in Johor).",
      "zh-TW": "柔佛州全州追思悼念已故蘇丹伊斯干達殿下的州定公眾假期。",
    },
  },
  // 17. Prophet Muhammad's Birthday - 15 & 16 August 2027
  {
    id: "holiday-2027-prophet-muhammads-birthday",
    isHoliday: true,
    startDate: "2027-08-15",
    endDate: "2027-08-16",
    dateLabel: {
      en: "15 & 16 August 2027",
      "zh-TW": "2027年8月15日–16日",
    },
    title: {
      en: "Prophet Muhammad's Birthday (Maulidur Rasul)",
      "zh-TW": "先知穆罕默德誕辰（Maulidur Rasul）",
    },
    summary: {
      en: "Observance of the blessed birth of the Prophet Muhammad, celebrated with spiritual gatherings and remembrance.",
      "zh-TW": "紀念伊斯蘭先知穆罕默德誕辰的全國法定節日，傳揚和平與慈愛。",
    },
  },
  // 18. Merdeka Day - 31 August 2027
  {
    id: "holiday-2027-merdeka-day",
    isHoliday: true,
    startDate: "2027-08-31",
    endDate: "2027-08-31",
    dateLabel: {
      en: "31 August 2027",
      "zh-TW": "2027年8月31日",
    },
    title: {
      en: "Merdeka Day (National Day)",
      "zh-TW": "國慶日（獨立日 / Merdeka Day）",
    },
    summary: {
      en: "National Day commemorating the historic declaration of independence of the Federation of Malaya in 1957.",
      "zh-TW": "紀念1957年馬來亞聯合邦莊嚴宣告獨立的全國國慶盛典。",
    },
  },
  // 19. Malaysia Day - 16 September 2027
  {
    id: "holiday-2027-malaysia-day",
    isHoliday: true,
    startDate: "2027-09-16",
    endDate: "2027-09-16",
    dateLabel: {
      en: "16 September 2027",
      "zh-TW": "2027年9月16日",
    },
    title: {
      en: "Malaysia Day",
      "zh-TW": "馬來西亞日（Malaysia Day）",
    },
    summary: {
      en: "National public holiday commemorating the formation of the Federation of Malaysia on 16 September 1963.",
      "zh-TW": "紀念1963年9月16日馬來西亞聯邦正式成立的全國法定公眾假期。",
    },
  },
]

/**
 * Filter public holidays for a given calendar year.
 */
export function getPublicHolidaysForYear(year: number): PublicHolidayItem[] {
  const yearStr = year.toString()
  return PUBLIC_HOLIDAYS.filter((h) => h.startDate.startsWith(yearStr))
}

/**
 * Filter public holidays for multiple calendar years.
 */
export function getPublicHolidaysForYears(years: number[]): PublicHolidayItem[] {
  const yearStrings = new Set(years.map((y) => y.toString()))
  return PUBLIC_HOLIDAYS.filter((h) => {
    const yr = h.startDate.substring(0, 4)
    return yearStrings.has(yr)
  })
}

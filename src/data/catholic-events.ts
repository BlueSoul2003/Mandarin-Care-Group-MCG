export interface CatholicEventItem {
  id: string
  isCatholic: true
  slug?: string
  startDate: string // YYYY-MM-DD
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
 * Computus: Anonymous Gregorian algorithm to calculate Easter Sunday for any year.
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime())
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function formatIsoDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Generate hardcoded Catholic liturgical feast days for a given calendar year.
 */
export function getCatholicEventsForYear(year: number): CatholicEventItem[] {
  const easter = getEasterSunday(year)

  const ashWednesday = addDays(easter, -46)
  const palmSunday = addDays(easter, -7)
  const holyThursday = addDays(easter, -3)
  const goodFriday = addDays(easter, -2)
  const holySaturday = addDays(easter, -1)
  const ascension = addDays(easter, 39) // 40th day counting Easter as Day 1

  return [
    {
      id: `catholic-${year}-ash-wednesday`,
      isCatholic: true,
      startDate: formatIsoDate(ashWednesday),
      title: {
        en: "Ash Wednesday",
        "zh-TW": "聖灰禮儀星期三",
      },
      summary: {
        en: "Marks the beginning of Lent, a 40-day season of prayer, fasting, and repentance in preparation for Easter.",
        "zh-TW": "標誌四旬期的開始，展開為期四十天祈禱、守齋、修和與悔改的恩寵時期，準備迎向復活節。",
      },
    },
    {
      id: `catholic-${year}-palm-sunday`,
      isCatholic: true,
      startDate: formatIsoDate(palmSunday),
      title: {
        en: "Palm Sunday (Passion Sunday)",
        "zh-TW": "聖枝主日（基督苦難主日）",
      },
      summary: {
        en: "Commemorates Jesus' triumphant entry into Jerusalem, heralding the start of Holy Week.",
        "zh-TW": "紀念耶穌光榮進入耶路撒冷，手持棕櫚枝歡呼讚美，正式開啟聖週的序幕。",
      },
    },
    {
      id: `catholic-${year}-holy-thursday`,
      isCatholic: true,
      startDate: formatIsoDate(holyThursday),
      title: {
        en: "Holy Thursday (Maundy Thursday)",
        "zh-TW": "建立聖體聖事（濯足星期四）",
      },
      summary: {
        en: "Commemorates the Last Supper, the institution of the Holy Eucharist and the Priesthood, and Christ's washing of the disciples' feet.",
        "zh-TW": "紀念最後的晚餐、建立聖體聖事與神品聖事，以及耶穌為門徒洗腳立下愛與服務的榜樣。",
      },
    },
    {
      id: `catholic-${year}-good-friday`,
      isCatholic: true,
      startDate: formatIsoDate(goodFriday),
      title: {
        en: "Good Friday",
        "zh-TW": "耶穌受難主日（救主苦難紀念）",
      },
      summary: {
        en: "Solemn remembrance of Christ's passion, crucifixion, and death at Calvary for the redemption of humanity.",
        "zh-TW": "莊嚴紀念基督在十字架上的苦難、受死與自我犧牲，帶來全人類的救贖之恩。",
      },
    },
    {
      id: `catholic-${year}-holy-saturday`,
      isCatholic: true,
      startDate: formatIsoDate(holySaturday),
      title: {
        en: "Holy Saturday (Easter Vigil)",
        "zh-TW": "聖週六（復活前夕守夜禮）",
      },
      summary: {
        en: "Day of prayerful vigil at the tomb, leading into the joyful celebration of the Easter Vigil at dusk.",
        "zh-TW": "在基督墓前靜默祈禱守夜，並於黃昏慶祝光明勝過黑暗的復活前夕禮儀。",
      },
    },
    {
      id: `catholic-${year}-easter-sunday`,
      isCatholic: true,
      startDate: formatIsoDate(easter),
      title: {
        en: "Easter Sunday (The Resurrection of the Lord)",
        "zh-TW": "耶穌復活主日（復活節）",
      },
      summary: {
        en: "The greatest feast of the Church year, celebrating Jesus Christ's glorious triumph over sin and death.",
        "zh-TW": "教會禮儀年中最尊貴的光榮慶節，歡慶主耶穌戰勝死亡與罪惡、光榮復活。",
      },
    },
    {
      id: `catholic-${year}-ascension`,
      isCatholic: true,
      startDate: formatIsoDate(ascension),
      title: {
        en: "Ascension of the Lord",
        "zh-TW": "耶穌升天節",
      },
      summary: {
        en: "Celebrates Jesus Christ's bodily ascension into heaven 40 days after His resurrection, seated at the right hand of the Father.",
        "zh-TW": "紀念復活的主耶穌在復活後第四十天光榮升天，坐在天父右邊，並應許派遣聖神。",
      },
    },
    {
      id: `catholic-${year}-assumption`,
      isCatholic: true,
      startDate: `${year}-08-15`,
      title: {
        en: "Assumption of the Blessed Virgin Mary",
        "zh-TW": "聖母蒙召升天節",
      },
      summary: {
        en: "Commemorates the bodily assumption of the Mother of God into heavenly glory at the end of her earthly life.",
        "zh-TW": "慶祝聖母瑪利亞在世旅程結束後，靈魂與肉身一同蒙召升入天國榮耀之中。",
      },
    },
    {
      id: `catholic-${year}-all-saints`,
      isCatholic: true,
      startDate: `${year}-11-01`,
      title: {
        en: "All Saints' Day",
        "zh-TW": "諸聖瞻禮（諸聖節）",
      },
      summary: {
        en: "Solemnity honouring all the saints and martyrs in heaven, both known and unknown.",
        "zh-TW": "敬禮天國中所有有名與無名的聖人聖女，慶祝諸聖相通的信德奧蹟。",
      },
    },
    {
      id: `catholic-${year}-all-souls`,
      isCatholic: true,
      startDate: `${year}-11-02`,
      title: {
        en: "All Souls' Day",
        "zh-TW": "追思已亡節（追思亡者）",
      },
      summary: {
        en: "A day of dedicated prayer and Holy Mass for all the faithful departed.",
        "zh-TW": "特別為所有已逝信友與親人奉獻祈禱與追思彌撒，祈求天主恩賜永恆平安與真光。",
      },
    },
    {
      id: `catholic-${year}-christmas`,
      isCatholic: true,
      startDate: `${year}-12-25`,
      title: {
        en: "Christmas / Nativity of the Lord",
        "zh-TW": "聖誕節（耶穌聖誕瞻禮）",
      },
      summary: {
        en: "Celebrates the joyous birth of Jesus Christ, the Word made flesh and Prince of Peace.",
        "zh-TW": "歡慶救主耶穌基督降生成人、誕生於白冷，為世人帶來光明、平安與希望。",
      },
    },
  ]
}

/**
 * Generate Catholic events for a list of years.
 */
export function getCatholicEventsForYears(years: number[]): CatholicEventItem[] {
  return years.flatMap((y) => getCatholicEventsForYear(y))
}

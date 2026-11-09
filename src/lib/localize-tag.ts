const TAG_TRANSLATIONS: Record<string, { en: string; "zh-TW": string }> = {
  // Prayers / Devotion
  "祷文": { en: "Prayers", "zh-TW": "禱文" },
  "禱文": { en: "Prayers", "zh-TW": "禱文" },
  "祈祷": { en: "Prayer", "zh-TW": "祈禱" },
  "祈禱": { en: "Prayer", "zh-TW": "祈禱" },
  "灵修": { en: "Spiritual", "zh-TW": "靈修" },
  "靈修": { en: "Spiritual", "zh-TW": "靈修" },
  "spiritual": { en: "Spiritual", "zh-TW": "靈修" },

  // Lifestyle / Campus
  "生活": { en: "Lifestyle", "zh-TW": "生活" },
  "lifestyle": { en: "Lifestyle", "zh-TW": "生活" },
  "校园": { en: "Campus Life", "zh-TW": "校園生活" },
  "校園": { en: "Campus Life", "zh-TW": "校園生活" },
  "大学": { en: "University", "zh-TW": "大學生活" },
  "大學": { en: "University", "zh-TW": "大學生活" },

  // Faith / Formation
  "信仰": { en: "Faith", "zh-TW": "信仰" },
  "faith": { en: "Faith", "zh-TW": "信仰" },
  "圣经": { en: "Scripture", "zh-TW": "聖經" },
  "聖經": { en: "Scripture", "zh-TW": "聖經" },
  "教会": { en: "Church", "zh-TW": "教會" },
  "教會": { en: "Church", "zh-TW": "教會" },

  // Community / Fellowship
  "活动": { en: "Events", "zh-TW": "活動" },
  "活動": { en: "Events", "zh-TW": "活動" },
  "团契": { en: "Fellowship", "zh-TW": "團契" },
  "團契": { en: "Fellowship", "zh-TW": "團契" },
  "分享": { en: "Reflection", "zh-TW": "心得分享" },
  "迎新": { en: "Orientation", "zh-TW": "迎新" },
}

export function localizeTag(tag: string, locale: string): string {
  const trimmed = tag.trim()
  const lower = trimmed.toLowerCase()

  if (TAG_TRANSLATIONS[trimmed]) {
    return locale === "zh-TW" ? TAG_TRANSLATIONS[trimmed]["zh-TW"] : TAG_TRANSLATIONS[trimmed].en
  }
  if (TAG_TRANSLATIONS[lower]) {
    return locale === "zh-TW" ? TAG_TRANSLATIONS[lower]["zh-TW"] : TAG_TRANSLATIONS[lower].en
  }

  return trimmed
}


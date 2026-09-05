export type MysteryType = "joyful" | "luminous" | "sorrowful" | "glorious"

export interface MysteryDetail {
  number: number
  title: string
  description: string
}

export interface RosaryStep {
  id: number
  decadeIndex: number // 0 for intro, 1..5 for decades, 6 for closing
  decadeLabel: string
  sectionTitle: string
  prayerType: "sign-of-cross" | "creed" | "our-father" | "hail-mary" | "glory-be" | "fatima" | "mystery" | "hail-holy-queen" | "concluding"
  totalHailMarys?: number // 3 for intro, 10 for decades
  title: string
  description?: string
  content: string
}

export interface MysterySet {
  type: MysteryType
  name: string
  days: string
  mysteries: MysteryDetail[]
}

export const DEFAULT_ROSARY_AUDIO_MAP: Record<"en" | "zh-TW", Record<string, string>> = {
  en: {
    "sign-of-cross": `/api/audio/${encodeURIComponent("Sign of the cross.mp3")}`,
    creed: `/api/audio/${encodeURIComponent("Apostle Creed.mp3")}`,
    "our-father": `/api/audio/${encodeURIComponent("Our Father.mp3")}`,
    "hail-mary": `/api/audio/${encodeURIComponent("Hail Mary.mp3")}`,
    "glory-be": `/api/audio/${encodeURIComponent("Glory Be.mp3")}`,
    fatima: `/api/audio/${encodeURIComponent("Fatima Prayer.mp3")}`,
    "hail-holy-queen": `/api/audio/${encodeURIComponent("Hail Holy Queen.mp3")}`,
    concluding: `/api/audio/${encodeURIComponent("Conclude.mp3")}`,
  },
  "zh-TW": {
    "sign-of-cross": `/api/audio/${encodeURIComponent("Sign of the cross-zh.mp3")}`,
    creed: `/api/audio/${encodeURIComponent("Apostle Creed-zh.mp3")}`,
    "our-father": `/api/audio/${encodeURIComponent("Our Father-zh.mp3")}`,
    "hail-mary": `/api/audio/${encodeURIComponent("Hail Mary-zh.mp3")}`,
    "glory-be": `/api/audio/${encodeURIComponent("Glory Be-zh.mp3")}`,
    fatima: `/api/audio/${encodeURIComponent("Fatima Prayer-zh.mp3")}`,
    "hail-holy-queen": `/api/audio/${encodeURIComponent("Hail Holy Queen-zh.mp3")}`,
    concluding: `/api/audio/${encodeURIComponent("Conclude-zh.mp3")}`,
  },
}

export const ROSARY_PRAYERS = {
  en: {
    signOfCross: {
      title: "Sign of the Cross",
      content: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    },
    creed: {
      title: "Apostles' Creed",
      content: "I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He will come to judge the living and the dead.\n\nI believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
    },
    ourFather: {
      title: "The Lord's Prayer (Our Father)",
      content: "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven.\n\nGive us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
    },
    hailMary: {
      title: "Hail Mary",
      content: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus.\n\nHoly Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
    },
    gloryBe: {
      title: "Glory Be",
      content: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
    },
    fatima: {
      title: "Fatima Prayer (O My Jesus)",
      content: "O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those in most need of Thy mercy. Amen.",
    },
    hailHolyQueen: {
      title: "Hail, Holy Queen (Salve Regina)",
      content: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears.\n\nTurn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\nPray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
    },
    concludingPrayer: {
      title: "Concluding Prayer",
      content: "Let us pray:\n\nO God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.",
    },
    introLabel: "Intro: Sign of Cross",
    closingLabel: "Closing: Hail Holy Queen",
    mysteries: {
      joyful: {
        name: "Joyful Mysteries",
        days: "Monday & Saturday",
        items: [
          {
            number: 1,
            title: "The Annunciation",
            description: "The Angel Gabriel announces to the Virgin Mary that she will conceive the Son of God by the power of the Holy Spirit.",
          },
          {
            number: 2,
            title: "The Visitation",
            description: "Mary visits her cousin Elizabeth, who is pregnant with John the Baptist, and proclaims the Magnificat.",
          },
          {
            number: 3,
            title: "The Nativity of the Lord",
            description: "Jesus is born in a humble manger in Bethlehem, bringing light and peace to all humanity.",
          },
          {
            number: 4,
            title: "The Presentation in the Temple",
            description: "Mary and Joseph present the infant Jesus in the Temple according to the Law of the Lord.",
          },
          {
            number: 5,
            title: "The Finding in the Temple",
            description: "After three days of searching, Mary and Joseph find Jesus in the Temple, listening and asking questions among the teachers.",
          },
        ],
      },
      luminous: {
        name: "Luminous Mysteries",
        days: "Thursday",
        items: [
          {
            number: 1,
            title: "The Baptism in the Jordan",
            description: "Jesus is baptized by John in the Jordan River, and the voice of the Father proclaims: 'This is my beloved Son.'",
          },
          {
            number: 2,
            title: "The Wedding at Cana",
            description: "At Mary's request, Jesus performs His first public sign by changing water into wine.",
          },
          {
            number: 3,
            title: "The Proclamation of the Kingdom",
            description: "Jesus calls all people to repent, believe the Good News, and welcome the Kingdom of God.",
          },
          {
            number: 4,
            title: "The Transfiguration",
            description: "Jesus is transfigured on Mount Tabor in radiant glory before Peter, James, and John.",
          },
          {
            number: 5,
            title: "The Institution of the Eucharist",
            description: "At the Last Supper, Jesus gives us His Body and Blood in the Holy Eucharist as the bread of eternal life.",
          },
        ],
      },
      sorrowful: {
        name: "Sorrowful Mysteries",
        days: "Tuesday & Friday",
        items: [
          {
            number: 1,
            title: "The Agony in the Garden",
            description: "Jesus prays in anguish at Gethsemane: 'Father, if You are willing, take this cup from me; yet not my will, but Yours be done.'",
          },
          {
            number: 2,
            title: "The Scourging at the Pillar",
            description: "Jesus is bound to a pillar and cruelly scourged by the Roman soldiers for our sins.",
          },
          {
            number: 3,
            title: "The Crowning with Thorns",
            description: "The soldiers mock Jesus as King, placing a crown of sharp thorns upon His head.",
          },
          {
            number: 4,
            title: "The Carrying of the Cross",
            description: "Jesus carries the heavy burden of the cross on the road to Calvary for our redemption.",
          },
          {
            number: 5,
            title: "The Crucifixion and Death of our Lord",
            description: "Jesus hangs on the cross for three hours, forgives His executioners, and surrenders His spirit to the Father.",
          },
        ],
      },
      glorious: {
        name: "Glorious Mysteries",
        days: "Wednesday & Sunday",
        items: [
          {
            number: 1,
            title: "The Resurrection",
            description: "On the third day, Jesus rises triumphantly from the dead, conquering sin and death forever.",
          },
          {
            number: 2,
            title: "The Ascension",
            description: "Forty days after His resurrection, Jesus ascends body and soul into heaven before His disciples.",
          },
          {
            number: 3,
            title: "The Descent of the Holy Spirit",
            description: "The Holy Spirit descends upon the Blessed Virgin Mary and the Apostles at Pentecost in tongues of fire.",
          },
          {
            number: 4,
            title: "The Assumption of Mary",
            description: "At the end of her earthly life, the Blessed Virgin Mary is assumed body and soul into heavenly glory.",
          },
          {
            number: 5,
            title: "The Coronation of Mary",
            description: "Mary is crowned as Queen of Heaven and Earth by her Divine Son amidst the angels and saints.",
          },
        ],
      },
    },
  },
  "zh-TW": {
    signOfCross: {
      title: "十字聖號",
      content: "因父，及子，及聖神之名。阿們。",
    },
    creed: {
      title: "宗徒信經",
      content: "我信全能的天主父，天地萬物的創造者。我信父的唯一子，我們的主耶穌基督。祂因聖神降孕，由童貞瑪利亞誕生。祂在比拉多執政時蒙難，被釘在十字架上，死而安葬。祂下降陰府，第三日從死者中復活。祂升了天，坐在全能天主父的右邊。祂還要從天降來，審判生者死者。\n\n我信聖神。我信聖而公教會，諸聖的相通。我信罪過的赦免。我信肉身的復活。我信永恆的生命。阿們。",
    },
    ourFather: {
      title: "天主經",
      content: "我們的天父，願祢的名受顯揚；願祢的國來臨；願祢的旨意奉行在人間，如同在天上。\n\n求祢今天賞給我們日用的食糧；求祢寬恕我們的罪過，如同我們寬恕别人一样；不要讓我們陷於誘惑，但救我們免於凶惡。阿們。",
    },
    hailMary: {
      title: "聖母經",
      content: "萬福瑪利亞，妳充满聖寵，主與妳同在。妳在婦女中受讚頌，妳的親子耶穌同受讚頌。\n\n天主聖母瑪利亞，求妳現在和我們臨終時，為我們罪人祈求天主。阿們。",
    },
    gloryBe: {
      title: "聖三光榮頌",
      content: "願光榮歸於父、及子、及聖神。起初如何，今日亦然，直到永遠。阿們。",
    },
    fatima: {
      title: "法蒂瑪聖母祈禱文 (法蒂瑪短誦)",
      content: "吾主耶穌，請寬赦我們的罪過，救我們於地狱永火之中。求祢把眾人的靈魂，特別是那些最需要祢憐憫的靈魂，領到天國裡去。阿們。",
    },
    hailHolyQueen: {
      title: "母后萬福",
      content: "母后萬福！仁慈的母親，我們的生命，我們的甘飴，我們的希望。厄娃子孫，在此塵世，向妳哀呼。在這涕泣之谷，向妳嘆息哭求。\n\n我們的主保，求妳回顧，憐視我們。一旦流亡期滿，使我們得見妳的聖子，萬民稱頌的耶穌。童貞瑪利亞，妳是寬仁的，慈悲的，甘飴的。\n\n天主聖母，請為我們祈求，使我們堪當承受基督的恩許。阿們。",
    },
    concludingPrayer: {
      title: "結束祈禱文",
      content: "請大家祈禱：\n\n天主！因祢唯一圣子的降生、死亡和复活，为我们获得了永生的赏报；我们恳求祢，使我们默想圣母玫瑰经的奥迹，并能效法其中的含意，获得其中的许诺，因我们的主基督。阿们。",
    },
    introLabel: "序禱：十字聖號",
    closingLabel: "結束：萬福母后",
    mysteries: {
      joyful: {
        name: "歡喜奧蹟",
        days: "星期一、星期六",
        items: [
          {
            number: 1,
            title: "天使報喜",
            description: "天使加俾額爾向童貞瑪利亞報喜，瑪利亞謙遜地回答：『我是主的婢女，願照祢的話成就於我。』",
          },
          {
            number: 2,
            title: "聖母訪親",
            description: "聖母滿懷愛德，走過山嶺探訪年老的表姐依撒伯爾，並讚頌天主的偉大與仁慈。",
          },
          {
            number: 3,
            title: "耶穌誕生",
            description: "救主耶穌在白冷簡陋的馬槽中降生，天使歌唱，牧童前來朝拜，帶給世人和平。",
          },
          {
            number: 4,
            title: "耶穌獻聖殿",
            description: "聖母與若瑟依照梅瑟法律，將嬰孩耶穌奉獻於聖殿，西默盎讚美天主並預言聖母將受利刃刺心。",
          },
          {
            number: 5,
            title: "耶穌在聖殿中講道",
            description: "聖母與若瑟焦急尋找三日後，在聖殿中看見十二歲的耶穌坐在經師中間，聆聽並發問。",
          },
        ],
      },
      luminous: {
        name: "光明奧蹟",
        days: "星期四",
        items: [
          {
            number: 1,
            title: "耶穌在約旦河受洗",
            description: "耶穌在約旦河接受若翰洗禮，聖神如鴿子降下，天父聲音說：『這是我的愛子，我所喜悅的。』",
          },
          {
            number: 2,
            title: "耶穌在加納婚宴變水為酒",
            description: "在加納婚宴上，聖母轉求耶穌，耶穌行了第一個奇蹟，變水為酒，門徒便信從了祂。",
          },
          {
            number: 3,
            title: "耶穌宣講天國福音",
            description: "耶穌走遍各城各鄉宣講天國：『時期已滿，天國臨近了，你們悔改，信從福音罷！』",
          },
          {
            number: 4,
            title: "耶穌顯聖容",
            description: "耶穌帶領伯多祿、雅各伯和若望登上高山，在他們面前顯出光輝奪目的神聖容貌。",
          },
          {
            number: 5,
            title: "耶穌建立聖體聖事",
            description: "在最後晚餐中，耶穌拿起麵餅和酒，祝謝後分給門徒說：『這是我的身體，這是我的血。』",
          },
        ],
      },
      sorrowful: {
        name: "痛苦奧蹟",
        days: "星期二、星期五",
        items: [
          {
            number: 1,
            title: "耶穌山園祈禱",
            description: "耶穌在革責瑪尼山園承受巨大的痛苦與憂悶，流汗如血滴，祈禱說：『父啊！願祢的旨意承行。』",
          },
          {
            number: 2,
            title: "耶穌受鞭打",
            description: "比拉多下令將無罪的耶穌捆綁於石柱上，承受羅馬士兵極其殘酷的鞭笞。",
          },
          {
            number: 3,
            title: "耶穌受茨冠之苦",
            description: "士兵們用荊棘編成茨冠戴在耶穌頭上，披上紫袍，屈膝戲弄祂：『猶太人的君王，萬歲！』",
          },
          {
            number: 4,
            title: "耶穌背十字架",
            description: "耶穌背負著沈重無比的十字架，蹣跚走向加爾瓦略山，沿途安慰痛哭的婦女們。",
          },
          {
            number: 5,
            title: "耶穌被釘十字架受難",
            description: "耶穌被釘在十字架上三個小時，為罪人求赦，把聖母託付給若望，最後交出靈魂。",
          },
        ],
      },
      glorious: {
        name: "榮福奧蹟",
        days: "星期三、星期日",
        items: [
          {
            number: 1,
            title: "耶穌復活",
            description: "第三天清晨，耶穌以大能戰勝死亡與罪惡，光榮地從死者中復活，帶給世人永生希望。",
          },
          {
            number: 2,
            title: "耶穌升天",
            description: "復活後第四十天，耶穌在門徒眼前升天，坐在全能天主父的右邊，並許諾派遣聖神。",
          },
          {
            number: 3,
            title: "聖神降臨",
            description: "五旬節那天，聖神藉火舌的形狀降臨在聖母及宗徒們身上，教會由此展開宣講。",
          },
          {
            number: 4,
            title: "聖母蒙召升天",
            description: "榮福童貞瑪利亞結束世間旅程後，身體和靈魂一同被接升入天國，共享永遠榮福。",
          },
          {
            number: 5,
            title: "聖母加冕為天地母后",
            description: "聖母在天國受天主聖三加冕為天地的母后，永為我們在天主台前仁慈的主保與轉求者。",
          },
        ],
      },
    },
  },
}

export function getTodaysMystery(): MysteryType {
  const day = new Date().getDay() // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  switch (day) {
    case 1:
    case 6:
      return "joyful"
    case 2:
    case 5:
      return "sorrowful"
    case 3:
    case 0:
      return "glorious"
    case 4:
      return "luminous"
    default:
      return "joyful"
  }
}

export function getDecadeLabels(mysteryType: MysteryType, locale: "en" | "zh-TW"): string[] {
  const texts = ROSARY_PRAYERS[locale] || ROSARY_PRAYERS.en
  const items = texts.mysteries[mysteryType].items
  const ordinalsEn = ["1st", "2nd", "3rd", "4th", "5th"]
  const ordinalsZh = ["第一端", "第二端", "第三端", "第四端", "第五端"]

  return [
    texts.introLabel,
    ...items.map((item, idx) =>
      locale === "zh-TW"
        ? `${ordinalsZh[idx]}：${item.title}`
        : `${ordinalsEn[idx]} Mystery: ${item.title}`
    ),
    texts.closingLabel,
  ]
}

export function generateRosarySteps(mysteryType: MysteryType, locale: "en" | "zh-TW"): RosaryStep[] {
  const texts = ROSARY_PRAYERS[locale] || ROSARY_PRAYERS.en
  const mysterySet = texts.mysteries[mysteryType]
  const decadeLabels = getDecadeLabels(mysteryType, locale)
  const steps: RosaryStep[] = []
  let id = 0

  // --- 0. Introductory Prayers (序禱) ---
  const introLabel = decadeLabels[0]

  // 1. Sign of the Cross
  steps.push({
    id: id++,
    decadeIndex: 0,
    decadeLabel: introLabel,
    sectionTitle: introLabel,
    prayerType: "sign-of-cross",
    title: texts.signOfCross.title,
    content: texts.signOfCross.content,
  })

  // 2. Apostles' Creed
  steps.push({
    id: id++,
    decadeIndex: 0,
    decadeLabel: introLabel,
    sectionTitle: introLabel,
    prayerType: "creed",
    title: texts.creed.title,
    content: texts.creed.content,
  })

  // 3. Our Father
  steps.push({
    id: id++,
    decadeIndex: 0,
    decadeLabel: introLabel,
    sectionTitle: introLabel,
    prayerType: "our-father",
    title: texts.ourFather.title,
    content: texts.ourFather.content,
  })

  // 4. Hail Mary (3 beads for intro)
  steps.push({
    id: id++,
    decadeIndex: 0,
    decadeLabel: introLabel,
    sectionTitle: introLabel,
    prayerType: "hail-mary",
    totalHailMarys: 3,
    title: texts.hailMary.title,
    content: texts.hailMary.content,
  })

  // 5. Glory Be
  steps.push({
    id: id++,
    decadeIndex: 0,
    decadeLabel: introLabel,
    sectionTitle: introLabel,
    prayerType: "glory-be",
    title: texts.gloryBe.title,
    content: texts.gloryBe.content,
  })

  // 6. Fatima Prayer
  steps.push({
    id: id++,
    decadeIndex: 0,
    decadeLabel: introLabel,
    sectionTitle: introLabel,
    prayerType: "fatima",
    title: texts.fatima.title,
    content: texts.fatima.content,
  })

  // --- 1..5 Decades (第一端至第五端) ---
  mysterySet.items.forEach((item, idx) => {
    const decadeIndex = idx + 1
    const decadeLabel = decadeLabels[decadeIndex]

    // 1. Announce Mystery
    steps.push({
      id: id++,
      decadeIndex,
      decadeLabel,
      sectionTitle: decadeLabel,
      prayerType: "mystery",
      title: decadeLabel,
      description: item.description,
      content: item.description,
    })

    // 2. Our Father
    steps.push({
      id: id++,
      decadeIndex,
      decadeLabel,
      sectionTitle: decadeLabel,
      prayerType: "our-father",
      title: texts.ourFather.title,
      content: texts.ourFather.content,
    })

    // 3. Hail Mary (10 beads for decade)
    steps.push({
      id: id++,
      decadeIndex,
      decadeLabel,
      sectionTitle: decadeLabel,
      prayerType: "hail-mary",
      totalHailMarys: 10,
      title: texts.hailMary.title,
      content: texts.hailMary.content,
    })

    // 4. Glory Be
    steps.push({
      id: id++,
      decadeIndex,
      decadeLabel,
      sectionTitle: decadeLabel,
      prayerType: "glory-be",
      title: texts.gloryBe.title,
      content: texts.gloryBe.content,
    })

    // 5. Fatima Prayer
    steps.push({
      id: id++,
      decadeIndex,
      decadeLabel,
      sectionTitle: decadeLabel,
      prayerType: "fatima",
      title: texts.fatima.title,
      content: texts.fatima.content,
    })
  })

  // --- 6. Concluding Prayers (結束祈禱) ---
  const closingLabel = decadeLabels[6]

  // Hail Holy Queen
  steps.push({
    id: id++,
    decadeIndex: 6,
    decadeLabel: closingLabel,
    sectionTitle: closingLabel,
    prayerType: "hail-holy-queen",
    title: texts.hailHolyQueen.title,
    content: texts.hailHolyQueen.content,
  })

  // Concluding Prayer
  steps.push({
    id: id++,
    decadeIndex: 6,
    decadeLabel: closingLabel,
    sectionTitle: closingLabel,
    prayerType: "concluding",
    title: texts.concludingPrayer.title,
    content: texts.concludingPrayer.content,
  })

  // Final Sign of the Cross
  steps.push({
    id: id++,
    decadeIndex: 6,
    decadeLabel: closingLabel,
    sectionTitle: closingLabel,
    prayerType: "sign-of-cross",
    title: texts.signOfCross.title,
    content: texts.signOfCross.content,
  })

  return steps
}

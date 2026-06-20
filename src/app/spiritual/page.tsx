import { ArticleCard } from "@/components/ArticleCard"

const SPIRITUAL_ARTICLES = [
  {
    slug: "daily-examen-guide",
    title: "每日意識省察指南 (Daily Examen)",
    excerpt: "意識省察是依納爵靈修的核心。透過每天十五分鐘的靜默，回顧一天中天主的臨在，幫助我們在忙碌的生活中保持對神的敏銳度。",
    date: "Nov 01, 2026",
    author: "Spiritual Director",
    tags: ["Examen"],
    category: "spiritual" as const,
  },
  {
    slug: "taize-prayer-introduction",
    title: "在靜默與歌聲中遇見神：泰澤祈禱介紹",
    excerpt: "泰澤祈禱透過重複、簡短的聖歌，帶領我們進入深層的祈禱與靜默。本篇文章將介紹泰澤祈禱的精神，以及如何在日常生活中實踐。",
    date: "Oct 05, 2026",
    author: "Music Ministry",
    tags: ["Taizé", "Prayer"],
    category: "spiritual" as const,
  },
]

export default function SpiritualPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">Spiritual</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          心靈庇護所。提供線上靈修資源、祈禱指南與信仰文章，陪伴你的靈性旅程。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SPIRITUAL_ARTICLES.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </div>
    </div>
  )
}

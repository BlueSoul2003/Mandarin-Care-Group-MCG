import { LifestyleClient } from "./LifestyleClient"
import { EventTimeline } from "@/components/EventTimeline"
import { contentRepository } from "@/content"
import { getTranslations } from "next-intl/server"

export const revalidate = 300

export default async function LifestylePage() {
  const t = await getTranslations("Lifestyle")
  const repository = await contentRepository()
  const content = await repository.listPublishedArticles("lifestyle")

  const articles = content.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    date: article.publishedAt,
    author: article.authorName,
    tags: article.tags,
    category: "lifestyle" as const,
  }))
  
  // Extract unique tags
  const tagsSet = new Set<string>()
  articles.forEach(article => {
    article.tags.forEach(tag => tagsSet.add(tag))
  })
  const allTags = ["All", ...Array.from(tagsSet)]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Page Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2.5">{t("title")}</h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {t("desc")}
        </p>
      </div>

      {/* Event Timeline */}
      <div className="mb-14 md:mb-16">
        <EventTimeline />
      </div>

      {/* Articles Section */}
      <div className="pt-12 border-t border-border/60">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight">
            {t("articlesTitle")}
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {t("articlesSubtitle")}
          </p>
        </div>

        <LifestyleClient articles={articles} allTags={allTags} />
      </div>
    </div>
  )
}


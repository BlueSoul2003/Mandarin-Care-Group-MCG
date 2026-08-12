import { LifestyleClient } from "./LifestyleClient"
import { contentRepository } from "@/content"
import { getTranslations } from "next-intl/server"

export const revalidate = 3600

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
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">{t("title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("desc")}
        </p>
      </div>

      <LifestyleClient articles={articles} allTags={allTags} />
    </div>
  )
}

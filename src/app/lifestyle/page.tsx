import { LifestyleClient } from "./LifestyleClient"
import { contentRepository } from "@/content"

export const revalidate = 3600

export default async function LifestylePage() {
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
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">Lifestyle</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          從信仰走進生活，分享大學生需要的實用知識與成長經驗。
        </p>
      </div>

      <LifestyleClient articles={articles} allTags={allTags} />
    </div>
  )
}

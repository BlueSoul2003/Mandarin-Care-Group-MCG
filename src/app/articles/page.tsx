import { contentRepository } from "@/content"
import { ArticleCard } from "@/components/ArticleCard"

export const revalidate = 3600

export default async function ArticlesPage() {
  const repository = await contentRepository()
  const articles = await repository.listPublishedArticles()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <header className="mb-14 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">MCG Journal</p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl">文章與故事</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          收錄信仰反思、活動故事與大學生活內容，逐步建立屬於 MCG 的長期刊物。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            slug={article.slug}
            title={article.title}
            excerpt={article.excerpt}
            date={article.publishedAt}
            author={article.authorName}
            tags={article.tags}
            category={article.section}
          />
        ))}
      </div>
    </div>
  )
}

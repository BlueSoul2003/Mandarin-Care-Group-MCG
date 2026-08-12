import { contentRepository } from "@/content"
import { ArticleCard } from "@/components/ArticleCard"
import { getTranslations } from "next-intl/server"

export const revalidate = 3600

export default async function ArticlesPage() {
  const t = await getTranslations("Articles")
  const repository = await contentRepository()
  const articles = await repository.listPublishedArticles()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <header className="mb-14 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">MCG Journal</p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("desc")}
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

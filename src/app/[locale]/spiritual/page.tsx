import { ArticleCard } from "@/components/ArticleCard"
import { contentRepository } from "@/content"
import { getTranslations } from "next-intl/server"

export const revalidate = 300

export default async function SpiritualPage() {
  const repository = await contentRepository()
  const articles = await repository.listPublishedArticles("spiritual")
  const t = await getTranslations("Spiritual")

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">{t("title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleCard
              key={article.slug}
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt}
              date={article.publishedAt}
              author={article.authorName}
              tags={article.tags}
              category="spiritual"
            />
          ))
        ) : (
          <p className="text-center col-span-2 text-muted-foreground py-10">{t("noArticles")}</p>
        )}
      </div>
    </div>
  )
}

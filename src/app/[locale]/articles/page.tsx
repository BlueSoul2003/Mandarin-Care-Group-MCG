import { contentRepository } from "@/content"
import { getTranslations } from "next-intl/server"
import { ArticlesClient, type ArticleTypeOption } from "./ArticlesClient"

export const revalidate = 60

function getArticleCanonicalType(article: { section: string; tags: string[] }): "spiritual" | "lifestyle" | "community" | "news" | "general" {
  const cat = article.section?.toLowerCase()
  if (cat === "spiritual") return "spiritual"
  if (cat === "lifestyle") return "lifestyle"
  if (cat === "community") return "community"
  if (cat === "news") return "news"

  const lowerTags = article.tags.map((t) => t.toLowerCase())
  if (lowerTags.some((t) => ["祷文", "禱文", "祈祷", "祈禱", "灵修", "靈修", "spiritual"].includes(t))) {
    return "spiritual"
  }
  if (lowerTags.some((t) => ["生活", "lifestyle", "校园", "校園", "大学", "大學"].includes(t))) {
    return "lifestyle"
  }
  if (lowerTags.some((t) => ["团契", "團契", "community"].includes(t))) {
    return "community"
  }

  return "general"
}

export default async function ArticlesPage() {
  const t = await getTranslations("Articles")
  const repository = await contentRepository()
  const content = await repository.listPublishedArticles()

  const articles = content.map((article) => {
    const canonicalType = getArticleCanonicalType(article)
    const effectiveCategory =
      article.section === "articles" && canonicalType !== "general"
        ? canonicalType
        : article.section

    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      date: article.publishedAt,
      author: article.authorName,
      tags: article.tags,
      category: effectiveCategory,
      canonicalType,
    }
  })

  // Calculate counts for each recognized type
  const counts: Record<string, number> = {
    all: articles.length,
    spiritual: articles.filter((a) => a.canonicalType === "spiritual").length,
    lifestyle: articles.filter((a) => a.canonicalType === "lifestyle").length,
    community: articles.filter((a) => a.canonicalType === "community").length,
    news: articles.filter((a) => a.canonicalType === "news").length,
  }

  const types: ArticleTypeOption[] = [
    { id: "all", label: t("all"), count: counts.all },
  ]

  if (counts.spiritual > 0) {
    types.push({
      id: "spiritual",
      label: t("categories.spiritual"),
      count: counts.spiritual,
    })
  }

  if (counts.lifestyle > 0) {
    types.push({
      id: "lifestyle",
      label: t("categories.lifestyle"),
      count: counts.lifestyle,
    })
  }

  if (counts.community > 0) {
    types.push({
      id: "community",
      label: t("categories.community"),
      count: counts.community,
    })
  }

  if (counts.news > 0) {
    types.push({
      id: "news",
      label: t("categories.news"),
      count: counts.news,
    })
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <header className="mb-14 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
          {t("tag")}
        </p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl text-foreground">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("desc")}
        </p>
      </header>

      <ArticlesClient articles={articles} types={types} />
    </div>
  )
}

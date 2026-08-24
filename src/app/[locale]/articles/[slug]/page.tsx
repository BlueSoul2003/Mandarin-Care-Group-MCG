import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { contentRepository } from "@/content"
import { ArticleReader } from "@/components/ArticleReader"

export const revalidate = 300

export async function generateStaticParams() {
  const repository = await contentRepository()
  const articles = await repository.listPublishedArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const repository = await contentRepository()
  const article = await repository.getArticleBySlug(slug)

  if (!article) notFound()

  return (
    <ArticleReader
      title={article.title}
      date={article.publishedAt}
      author={article.authorName}
      category={article.section}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {article.contentMarkdown}
      </ReactMarkdown>
    </ArticleReader>
  )
}

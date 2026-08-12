import { ArticleReader } from "@/components/ArticleReader"
import { contentRepository } from "@/content"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const revalidate = 3600

export async function generateStaticParams() {
  const repository = await contentRepository()
  const articles = await repository.listPublishedArticles("spiritual")
  return articles.map((article) => ({ slug: article.slug }))
}

export default async function SpiritualArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const repository = await contentRepository()
  const article = await repository.getArticleBySlug(slug)

  if (!article || article.section !== "spiritual") notFound()

  return (
    <ArticleReader
      title={article.title}
      date={article.publishedAt}
      author={article.authorName}
      category="spiritual"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {article.contentMarkdown}
      </ReactMarkdown>
    </ArticleReader>
  )
}

import { ArticleReader } from "@/components/ArticleReader"
import { contentRepository } from "@/content"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const revalidate = 300

// Generate static params for build time
export async function generateStaticParams() {
  const repository = await contentRepository()
  const articles = await repository.listPublishedArticles("lifestyle")
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default async function LifestyleArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const repository = await contentRepository()
  const content = await repository.getArticleBySlug(slug)
  
  if (!content || content.section !== "lifestyle") {
    notFound()
  }

  return (
    <ArticleReader
      title={content.title}
      date={content.publishedAt}
      author={content.authorName}
      category="lifestyle"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content.contentMarkdown}
      </ReactMarkdown>
    </ArticleReader>
  )
}

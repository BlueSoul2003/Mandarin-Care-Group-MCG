import { ArticleReader } from "@/components/ArticleReader"
import { getArticleContent, getLifestyleArticles } from "@/lib/notion"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const revalidate = 60 // ISR: Revalidate every 60 seconds

// Generate static params for build time
export async function generateStaticParams() {
  const articles = await getLifestyleArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default async function LifestyleArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const content = await getArticleContent(slug)
  
  if (!content) {
    notFound()
  }
  
  const { metadata, markdown } = content

  return (
    <ArticleReader
      title={metadata.title}
      date={metadata.date}
      author={metadata.author}
      category="lifestyle"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </ArticleReader>
  )
}

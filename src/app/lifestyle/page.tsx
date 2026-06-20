import { LifestyleClient } from "./LifestyleClient"
import { getLifestyleArticles } from "@/lib/notion"

export const revalidate = 60 // ISR: Revalidate every 60 seconds

export default async function LifestylePage() {
  const articles = await getLifestyleArticles()
  
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
          全人成長與生活指南。裝備自己，將信仰落實於校園與職場的實用文章。
        </p>
      </div>

      <LifestyleClient articles={articles} allTags={allTags} />
    </div>
  )
}

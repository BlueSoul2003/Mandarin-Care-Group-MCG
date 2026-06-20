"use client"

import * as React from "react"
import { ArticleCard } from "@/components/ArticleCard"
import { ArticleMeta } from "@/lib/notion"

export function LifestyleClient({ articles, allTags }: { articles: ArticleMeta[], allTags: string[] }) {
  const [selectedTag, setSelectedTag] = React.useState("All")

  const filteredArticles = selectedTag === "All" 
    ? articles 
    : articles.filter(article => article.tags.includes(selectedTag))

  return (
    <>
      {/* Pill Buttons Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTag === tag
                ? "bg-foreground text-background shadow-md scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))
        ) : (
          <p className="text-center col-span-2 text-muted-foreground py-10">尚無文章</p>
        )}
      </div>
    </>
  )
}

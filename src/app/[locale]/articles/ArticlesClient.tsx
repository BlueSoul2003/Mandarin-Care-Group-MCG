"use client"

import * as React from "react"
import { ArticleCard, type ArticleCardProps } from "@/components/ArticleCard"
import { useTranslations } from "next-intl"

export interface ArticleTypeOption {
  id: string
  label: string
  count: number
}

export interface ArticlesClientProps {
  articles: (ArticleCardProps & { canonicalType: string })[]
  types: ArticleTypeOption[]
}

export function ArticlesClient({ articles, types }: ArticlesClientProps) {
  const t = useTranslations("Articles")
  const [selectedType, setSelectedType] = React.useState<string>("all")

  const filteredArticles = React.useMemo(() => {
    if (selectedType === "all") return articles
    return articles.filter((article) => article.canonicalType === selectedType)
  }, [articles, selectedType])

  return (
    <>
      {types.length > 1 && (
        <div className="flex justify-center mb-10 sm:mb-14">
          <nav
            role="tablist"
            aria-label={t("title")}
            className="inline-flex items-center p-1 sm:p-1.5 rounded-full bg-muted/80 backdrop-blur-md border border-border/60 shadow-2xs gap-1 max-w-full overflow-x-auto"
          >
            {types.map((type) => {
              const isSelected = selectedType === type.id
              return (
                <button
                  key={type.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-background text-foreground shadow-xs font-semibold scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  }`}
                >
                  <span>{type.label}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "bg-background/60 text-muted-foreground"
                    }`}
                  >
                    {type.count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))
        ) : (
          <p className="text-center col-span-2 text-muted-foreground py-10">
            {t("noArticles")}
          </p>
        )}
      </div>
    </>
  )
}

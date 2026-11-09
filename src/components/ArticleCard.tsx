import { Link } from "@/i18n/routing"
import { ArrowRight, Calendar, User } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { localizeTag } from "@/lib/localize-tag"

export type ArticleCategory = "lifestyle" | "spiritual" | "community" | "news" | "articles"

export interface ArticleCardProps {
  title: string
  excerpt: string
  date: string
  author: string
  tags: string[]
  slug: string
  category: ArticleCategory
}

export function ArticleCard({ title, excerpt, date, author, tags, slug, category }: ArticleCardProps) {
  const t = useTranslations("Articles")
  const locale = useLocale()
  const href = `/articles/${slug}`

  const categoryLabel =
    category === "spiritual"
      ? t("categories.spiritual")
      : category === "lifestyle"
      ? t("categories.lifestyle")
      : category === "community"
      ? (t.has("categories.community" as any) ? t("categories.community" as any) : "Community")
      : category === "news"
      ? (t.has("categories.news" as any) ? t("categories.news" as any) : "News")
      : null

  const displayTags = tags
    .map((tag) => localizeTag(tag, locale))
    .filter((localizedTag) => !categoryLabel || localizedTag.toLowerCase() !== categoryLabel.toLowerCase())

  return (
    <article className="group relative flex flex-col items-start justify-between rounded-2xl bg-card p-6 md:p-8 shadow-sm border border-border/50 hover:shadow-md transition-all">
      <div className="flex items-center gap-x-2.5 text-xs mb-4 flex-wrap gap-y-2">
        {categoryLabel && (
          <span className="relative z-10 rounded-full bg-primary/10 text-primary font-medium px-2.5 py-1 text-[11px]">
            {categoryLabel}
          </span>
        )}
        <time dateTime={date} className="text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {date}
        </time>
        {displayTags.map((tag) => (
          <span
            key={tag}
            className="relative z-10 rounded-full bg-muted/80 px-2.5 py-1 font-medium text-muted-foreground text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="group relative max-w-xl">
        <h3 className="mt-3 text-xl md:text-2xl font-semibold leading-snug text-foreground group-hover:text-primary transition-colors whitespace-pre-line">
          <Link href={href}>
            <span className="absolute inset-0" />
            {title}
          </Link>
        </h3>
        <p className="mt-5 line-clamp-3 text-sm md:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
          {excerpt}
        </p>
      </div>
      <div className="relative mt-8 flex items-center gap-x-4 w-full justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="font-semibold">{author}</span>
        </div>
        <span
          aria-hidden="true"
          className="flex items-center text-primary text-sm font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none"
        >
          {t("readMore")} <ArrowRight className="ml-1 w-4 h-4" />
        </span>
      </div>
    </article>
  )
}

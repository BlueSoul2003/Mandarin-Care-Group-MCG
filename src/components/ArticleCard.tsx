import Link from "next/link"
import { ArrowRight, Calendar, User } from "lucide-react"

interface ArticleCardProps {
  title: string
  excerpt: string
  date: string
  author: string
  tags: string[]
  slug: string
  category: "lifestyle" | "spiritual"
}

export function ArticleCard({ title, excerpt, date, author, tags, slug, category }: ArticleCardProps) {
  return (
    <article className="group relative flex flex-col items-start justify-between rounded-2xl bg-card p-6 md:p-8 shadow-sm border border-border/50 hover:shadow-md transition-all">
      <div className="flex items-center gap-x-4 text-xs mb-4">
        <time dateTime={date} className="text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {date}
        </time>
        {tags.map((tag) => (
          <span
            key={tag}
            className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="group relative max-w-xl">
        <h3 className="mt-3 text-xl md:text-2xl font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          <Link href={`/${category}/${slug}`}>
            <span className="absolute inset-0" />
            {title}
          </Link>
        </h3>
        <p className="mt-5 line-clamp-3 text-sm md:text-base leading-relaxed text-muted-foreground">
          {excerpt}
        </p>
      </div>
      <div className="relative mt-8 flex items-center gap-x-4 w-full justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="font-semibold">{author}</span>
        </div>
        <div className="flex items-center text-primary text-sm font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Read more <ArrowRight className="ml-1 w-4 h-4" />
        </div>
      </div>
    </article>
  )
}

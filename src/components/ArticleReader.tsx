import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"

interface ArticleReaderProps {
  title: string
  date: string
  author: string
  category: "lifestyle" | "spiritual"
  children: React.ReactNode
}

export function ArticleReader({ title, date, author, category, children }: ArticleReaderProps) {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <Link
        href={`/${category}`}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="mr-2 w-4 h-4" />
        Back to {category === "lifestyle" ? "Lifestyle" : "Spiritual"}
      </Link>
      
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-foreground mb-6 leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-muted-foreground border-b border-border/50 pb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={date}>{date}</time>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{author}</span>
          </div>
        </div>
      </header>

      <div className="max-w-none font-serif leading-loose text-foreground/90 text-lg space-y-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:font-sans [&>h2]:mt-10 [&>h2]:mb-4 [&>p]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-4 [&>ol>li>strong]:font-sans [&>ol>li>strong]:text-foreground [&>ol>li>p]:mt-1 [&>ol>li>p]:mb-0 [&>ol>li]:mb-4">
        {children}
      </div>

      {category === "lifestyle" && (
        <div className="mt-16 bg-muted/30 rounded-2xl p-8 border border-border/50">
          <h3 className="font-bold text-lg mb-2">Discussion Prompts</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>What is the biggest challenge you face regarding this topic?</li>
            <li>How can you apply one principle from this article this week?</li>
          </ul>
        </div>
      )}
    </div>
  )
}

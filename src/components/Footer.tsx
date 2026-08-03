import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row mx-auto px-4">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built for the Mandarin Care Group, UTM. A digital sanctuary for holistic growth.
        </p>
        <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground" aria-label="頁尾導覽">
          <Link href="/events" className="hover:text-foreground">歷年活動</Link>
          <Link href="/articles" className="hover:text-foreground">文章</Link>
          <Link href="/history" className="hover:text-foreground">歷屆執委</Link>
        </nav>
      </div>
    </footer>
  )
}

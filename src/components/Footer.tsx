import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("Footer")
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row mx-auto px-4">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          {t('desc')}
        </p>
        <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground" aria-label={t('footerNavigation')}>
          <Link href="/events" className="hover:text-foreground">{t('events')}</Link>
          <Link href="/articles" className="hover:text-foreground">{t('articles')}</Link>
          <Link href="/history" className="hover:text-foreground">{t('committee')}</Link>
        </nav>
      </div>
    </footer>
  )
}

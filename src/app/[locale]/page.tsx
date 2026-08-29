import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import { LatestYouTubeVideo } from "@/components/LatestYouTubeVideo"
import { HomeHeroActions } from "@/components/HomeHeroActions"

export const revalidate = 300

export default async function Home() {
  const t = await getTranslations("Home")

  const LANDING_LINKS = [
    { href: "/events", label: t("pastEvents"), description: t("pastEventsDesc") },
    { href: "/articles", label: t("articlesAndStories"), description: t("articlesAndStoriesDesc") },
    { href: "/history", label: t("pastCommittees"), description: t("pastCommitteesDesc") },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-20 text-center">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-8 pb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground font-heading">
          {t("title")}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mb-8 leading-relaxed">
          {t("description")}
        </p>

        {/* Dynamic Action Buttons: hides login/register when authenticated */}
        <HomeHeroActions />
      </section>

      {/* Latest YouTube Video Section */}
      <LatestYouTubeVideo />

      {/* Content Navigation Section */}
      <section className="grid grid-cols-1 gap-5 py-12 text-left md:grid-cols-3" aria-label={t("contentNavigation")}>
        {LANDING_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-3xl border border-border/50 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-heading text-xl font-semibold group-hover:text-primary transition-colors">
              {item.label}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}

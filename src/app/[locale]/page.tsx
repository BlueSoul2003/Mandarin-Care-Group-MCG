import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import { LatestYouTubeVideo } from "@/components/LatestYouTubeVideo"
import { HomeHeroActions } from "@/components/HomeHeroActions"
import { UpcomingEventsSection } from "@/components/UpcomingEventsSection"
import { contentRepository } from "@/content"

export const revalidate = 60

export default async function Home() {
  const t = await getTranslations("Home")
  const repository = await contentRepository()
  const featuredEvents = await repository.listFeaturedEvents()

  const LANDING_LINKS = [
    { href: "/events", label: t("pastEvents"), description: t("pastEventsDesc") },
    { href: "/articles", label: t("articlesAndStories"), description: t("articlesAndStoriesDesc") },
    { href: "/history", label: t("pastCommittees"), description: t("pastCommitteesDesc") },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 pt-3 pb-6 md:pt-6 md:pb-8 text-center">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-1 pb-3 md:pt-2 md:pb-4">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 sm:mb-2.5 text-foreground font-heading">
          {t("title")}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-4 sm:mb-5 leading-relaxed">
          {t("description")}
        </p>

        {/* Dynamic Action Buttons: Explore Events (primary), Register & Login (secondary) */}
        <HomeHeroActions />
      </section>

      {/* Upcoming / Featured Events Section */}
      <UpcomingEventsSection events={featuredEvents} />

      {/* Latest YouTube Video Section */}
      <LatestYouTubeVideo />

      {/* Content Navigation Section */}
      <section className="grid grid-cols-1 gap-5 pt-6 pb-2 text-left md:grid-cols-3" aria-label={t("contentNavigation")}>
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

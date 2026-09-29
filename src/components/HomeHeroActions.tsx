"use client"

import { useEffect, useState } from "react"
import { Link } from "@/i18n/routing"
import { ArrowRight, LogIn, UserPlus, User as UserIcon } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useTranslations } from "next-intl"

export function HomeHeroActions() {
  const t = useTranslations("Home")
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Avoid hydration layout shift before mounting
  if (!mounted) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 min-h-[42px]">
        <Link
          href="/events"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 shadow-2xs transition-all active:scale-[0.98]"
        >
          {t("exploreEvents")} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
      {/* Primary Action */}
      <Link
        href="/events"
        className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 shadow-2xs transition-all active:scale-[0.98]"
      >
        {t("exploreEvents")} <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>

      {user ? (
        /* Logged in state: Replace register/login with Go to Profile */
        <Link
          href="/profile"
          className="inline-flex items-center justify-center rounded-full border border-border/80 bg-card/60 backdrop-blur-xs px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/70 hover:border-primary/40 transition-all shadow-2xs active:scale-[0.98]"
        >
          <UserIcon className="mr-1.5 h-4 w-4 text-primary" />
          <span>{t("viewProfile") || "My Profile"}</span>
        </Link>
      ) : (
        /* Guest state: Secondary actions */
        <>
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-full border border-border/80 bg-card/60 backdrop-blur-xs px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/70 hover:border-primary/40 transition-all shadow-2xs active:scale-[0.98]"
          >
            <UserPlus className="mr-1.5 h-4 w-4 text-muted-foreground" /> {t("register")}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-border/80 bg-card/60 backdrop-blur-xs px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/70 hover:border-primary/40 transition-all shadow-2xs active:scale-[0.98]"
          >
            <LogIn className="mr-1.5 h-4 w-4 text-muted-foreground" /> {t("login")}
          </Link>
        </>
      )}
    </div>
  )
}

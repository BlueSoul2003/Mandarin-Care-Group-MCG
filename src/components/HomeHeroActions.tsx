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
      <div className="flex flex-wrap justify-center gap-3 min-h-[44px]">
        <Link
          href="/events"
          className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 shadow-sm"
        >
          {t("exploreEvents")} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Link
        href="/events"
        className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 shadow-sm"
      >
        {t("exploreEvents")} <ArrowRight className="ml-2 h-4 w-4" />
      </Link>

      {user ? (
        /* Logged in state: Replace register/login with Go to Profile */
        <Link
          href="/profile"
          className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <UserIcon className="mr-2 h-4 w-4 text-primary" />
          <span>{t("viewProfile") || "My Profile"}</span>
        </Link>
      ) : (
        /* Guest state: Show Register and Login */
        <>
          <Link
            href="/join"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <UserPlus className="mr-2 h-4 w-4" /> {t("register")}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <LogIn className="mr-2 h-4 w-4" /> {t("login")}
          </Link>
        </>
      )}
    </div>
  )
}

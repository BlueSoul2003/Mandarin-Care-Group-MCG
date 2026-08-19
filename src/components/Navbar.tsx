"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Link } from "@/i18n/routing"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "./LanguageSwitcher"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "U"
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const [user, setUser] = React.useState<User | null>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const t = useTranslations("Navbar")

  React.useEffect(() => {
    const supabase = createClient()

    // Get the current session on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Listen for auth state changes (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const displayName: string =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User"

  const initials = getInitials(displayName)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-wider text-primary">MCG UTM</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/gallery" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("gallery")}</Link>
            <Link href="/spiritual" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("spiritual")}</Link>
            <Link href="/taize" className="transition-colors hover:text-primary text-foreground/60">{t("taize")}</Link>
            <Link href="/rosary" className="transition-colors hover:text-primary text-foreground/60">{t("rosary")}</Link>
            <Link href="/lifestyle" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("lifestyle")}</Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                {/* Avatar Badge — click to open dropdown */}
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all select-none"
                  title={t("loggedInAs", { name: displayName })}
                >
                  {initials}
                </button>

                {/* Dropdown Popout */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border/50">
                      <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {/* Actions */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        {t("signOut")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="transition-colors hover:text-primary text-foreground/60">{t("login")}</Link>
                <Link
                  href="/join"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-sm"
                >
                  {t("join")}
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              title={t("toggleTheme")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t("toggleTheme")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

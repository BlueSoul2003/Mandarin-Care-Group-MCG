"use client"

import * as React from "react"
import { Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Link } from "@/i18n/routing"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { motion, AnimatePresence } from "framer-motion"

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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const t = useTranslations("Navbar")
  // Prevent background scrolling when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

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
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { href: "/gallery", label: t("gallery") },
    { href: "/spiritual", label: t("spiritual") },
    { href: "/taize", label: t("taize") },
    { href: "/rosary", label: t("rosary") },
    { href: "/lifestyle", label: t("lifestyle") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 z-[60]">
            <span className="font-bold text-xl tracking-wider text-primary">MCG UTM</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">
                {link.label}
              </Link>
            ))}

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
                    <div className="px-4 py-3 border-b border-border/50">
                      <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-sm"
                >
                  {t("join")}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 z-[60]">
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

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-label={t("openMenu")}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-[70] w-3/4 max-w-sm border-l border-border bg-card p-6 shadow-2xl md:hidden overflow-y-auto flex flex-col h-[100dvh]"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl tracking-wider text-primary">MCG UTM</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={t("closeMenu")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border/50 flex flex-col space-y-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {initials}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold truncate">{displayName}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-destructive font-medium py-2 hover:bg-destructive/10 rounded-md transition-colors px-2 -mx-2"
                    >
                      {t("signOut")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/join"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    >
                      {t("join")}
                    </Link>
                  </>
                )}
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

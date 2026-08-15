"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
        title="Change Language"
      >
        <Languages className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle Language</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1 flex flex-col">
            <button
              onClick={() => switchLanguage("en")}
              className={`text-left px-4 py-2 text-sm transition-colors hover:bg-muted ${locale === "en" ? "font-semibold text-primary" : "text-foreground"}`}
            >
              English
            </button>
            <button
              onClick={() => switchLanguage("zh-TW")}
              className={`text-left px-4 py-2 text-sm transition-colors hover:bg-muted ${locale === "zh-TW" ? "font-semibold text-primary" : "text-foreground"}`}
            >
              繁體中文
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

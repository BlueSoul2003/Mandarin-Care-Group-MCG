"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export function Navbar() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-wider text-primary">MCG UTM</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/gallery" className="transition-colors hover:text-foreground/80 text-foreground/60">Gallery</Link>
            <Link href="/spiritual" className="transition-colors hover:text-foreground/80 text-foreground/60">Spiritual</Link>
            <Link href="/taize" className="transition-colors hover:text-primary text-foreground/60">Taizé</Link>
            <Link href="/rosary" className="transition-colors hover:text-primary text-foreground/60">Rosary</Link>
            <Link href="/lifestyle" className="transition-colors hover:text-foreground/80 text-foreground/60">Lifestyle</Link>
            <Link
              href="/join"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-sm"
            >
              加入我們
            </Link>
          </nav>
          <div className="flex items-center">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

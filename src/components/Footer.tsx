"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { MapPin } from "lucide-react"

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function Footer() {
  const t = useTranslations("Footer")

  return (
    <footer className="mt-auto border-t border-[#84632C]/15 bg-[#F2EFE9] text-[#2C2216] dark:border-white/10 dark:bg-[#151413] dark:text-[#E8E6DF] transition-colors">
      <div className="container mx-auto px-4 md:px-8 pt-7 pb-5 md:pt-8 md:pb-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
          {/* Column 1: Brand & Identity (md:col-span-4 lg:col-span-4) */}
          <div className="md:col-span-4 lg:col-span-4 space-y-3">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden ring-1 ring-[#84632C]/20 group-hover:ring-[#84632C]/50 transition-all shrink-0">
                <Image
                  src="/icon.png"
                  alt="MCG UTM"
                  fill
                  sizes="44px"
                  className="object-cover rounded-full"
                />
              </div>
              <span className="font-heading font-bold text-xl md:text-2xl tracking-wider text-[#2C2216] dark:text-[#FAF6EE] group-hover:text-[#84632C] transition-colors">
                MCG UTM
              </span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#6B5A46] dark:text-[#A89C8A]">
              <MapPin className="w-3.5 h-3.5 text-[#84632C] dark:text-[#C5A880] shrink-0" />
              <span>{t("campusLocation")}</span>
            </div>

            {/* Small YouTube Icon */}
            <div className="pt-0.5">
              <a
                href="https://www.youtube.com/@mcgutm5385"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MCG UTM YouTube"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#84632C]/8 hover:bg-[#84632C]/15 text-[#6B5A46] hover:text-[#84632C] dark:bg-white/5 dark:text-[#A89C8A] dark:hover:text-[#FAF6EE] border border-[#84632C]/20 hover:border-[#84632C]/40 transition-all group shadow-2xs"
                title="YouTube"
              >
                <YouTubeIcon className="w-3.5 h-3.5 fill-current group-hover:scale-105 transition-transform" />
              </a>
            </div>
          </div>

          {/* Nav Columns: 3 sections (md:col-span-8 lg:col-span-8) */}
          <div className="md:col-span-8 lg:col-span-8 grid grid-cols-2 sm:grid-cols-12 gap-6 md:gap-8">
            {/* Column 1: Community */}
            <div className="col-span-1 sm:col-span-3 space-y-2">
              <h4 className="text-xs md:text-[13px] font-bold uppercase tracking-wider text-[#332616] dark:text-[#FAF6EE] font-heading">
                {t("communityCol")}
              </h4>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link href="/lifestyle" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("lifestyle")}
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("events")}
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("gallery")}
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("committee")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Faith & Prayer */}
            <div className="col-span-1 sm:col-span-4 space-y-2">
              <h4 className="text-xs md:text-[13px] font-bold uppercase tracking-wider text-[#332616] dark:text-[#FAF6EE] font-heading">
                {t("spiritualCol")}
              </h4>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link href="/spiritual" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("spiritual")}
                  </Link>
                </li>
                <li>
                  <Link href="/rosary" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("rosary")}
                  </Link>
                </li>
                <li>
                  <Link href="/taize" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("taize")}
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="text-[#5C4C38] hover:text-[#84632C] dark:text-[#B5AA98] dark:hover:text-[#FAF6EE] transition-colors inline-block">
                    {t("articles")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Eucharistic Miracles Exhibition */}
            <div className="col-span-2 sm:col-span-5 space-y-2">
              <h4 className="text-xs md:text-[13px] font-bold uppercase tracking-wider text-[#332616] dark:text-[#FAF6EE] font-heading">
                {t("eucharisticMiraclesTitle")}
              </h4>
              <p className="text-sm leading-relaxed text-[#5C4C38] dark:text-[#B5AA98]">
                {t("eucharisticMiraclesDesc")}
              </p>
              <div className="pt-1">
                <a
                  href="https://www.miracolieucaristici.org/en/Liste/list.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#84632C] hover:text-[#5E441B] dark:text-[#C5A880] dark:hover:text-[#E8D49E] transition-colors group/link"
                >
                  <span>{t("eucharisticMiraclesAction")}</span>
                  <span className="transition-transform group-hover/link:translate-x-0.5" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Soft, delicate divider above copyright row */}
        <div className="mt-6 pt-4 border-t border-[#84632C]/12 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A7965] dark:text-[#8E8272] gap-2">
          <p>© {new Date().getFullYear()} MCG UTM. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  )
}

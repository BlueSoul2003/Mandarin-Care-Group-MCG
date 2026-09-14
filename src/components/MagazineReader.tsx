"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import type { Magazine } from "@/content/magazine"

export function MagazineReader({ magazine, title }: { magazine: Magazine; title: string }) {
  const t = useTranslations("Gallery")
  const [page, setPage] = useState(0)
  return (
    <section id="magazine" className="mt-20 scroll-mt-24" aria-labelledby="magazine-title">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 id="magazine-title" className="font-heading text-3xl font-bold">{t("magazine")}</h2>
        <a href={magazine.pdfUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border px-5 py-3 text-sm hover:bg-muted">{t("downloadPdf")}</a>
      </div>
      <div role="region" aria-label={t("readerLabel", { title })} tabIndex={0}
        className="rounded-2xl border bg-muted/30 p-3 md:p-8 focus-visible:outline-2 focus-visible:outline-primary"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            setPage((current) => Math.max(0, Math.min(magazine.pages.length - 1, current + (event.key === "ArrowLeft" ? -1 : 1))))
          }
        }}>
        <div className="mb-5 flex flex-wrap items-center justify-center gap-4 text-sm">
          <button className="rounded-full border px-4 py-2 disabled:opacity-40" disabled={page === 0} onClick={() => setPage(page - 1)}>{t("previousPage")}</button>
          <select aria-label={t("choosePage")} className="rounded border bg-background p-2" value={page} onChange={(event) => setPage(Number(event.target.value))}>
            {magazine.pages.map((_, index) => <option key={index} value={index}>{index + 1}</option>)}
          </select>
          <button className="rounded-full border px-4 py-2 disabled:opacity-40" disabled={page === magazine.pages.length - 1} onClick={() => setPage(page + 1)}>{t("nextPage")}</button>
          <span aria-live="polite">{t("pageCount", { current: page + 1, total: magazine.pages.length })}</span>
        </div>
        <Image key={page} src={magazine.pages[page]} alt={t("pageAlt", { title, page: page + 1 })} width={1200} height={1700} unoptimized className="mx-auto h-auto w-full max-w-3xl shadow-md" />
      </div>
    </section>
  )
}

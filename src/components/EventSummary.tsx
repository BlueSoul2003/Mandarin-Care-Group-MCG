import * as React from "react"
import { normalizeSummary } from "../content/plain-text"

export function EventSummary({ text }: { text: string }) {
  const parts = normalizeSummary(text).split(/(https?:\/\/[^\s<>"']+)/g)
  return (
    <p className="mx-auto mt-8 max-w-3xl whitespace-pre-line break-words text-lg leading-relaxed text-muted-foreground">
      {parts.map((part, index) => {
        if (!/^https?:\/\//.test(part)) return part
        try {
          const url = new URL(part)
          if (!url.hostname) return part
        } catch {
          return part
        }
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline underline-offset-4 hover:opacity-80">{part}</a>
      })}
    </p>
  )
}

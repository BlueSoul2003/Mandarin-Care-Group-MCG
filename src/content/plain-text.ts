// Some imported Notion summaries contain literal escaped line breaks.
export function normalizeSummary(value: string): string {
  return value.replace(/\\r\\n|\\n|\\r/g, "\n").replace(/\r\n?/g, "\n").trim()
}

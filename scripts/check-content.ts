import { getNotionContentConfig, loadNotionPublishedSnapshot } from "../src/content/notion-repository"
import type { ContentIssue } from "../src/content/diagnostics"

async function main() {
  const config = getNotionContentConfig()
  if (!config) {
    console.error("Notion content is not configured. Check NOTION_API_KEY and data-source IDs; no credentials were printed.")
    process.exitCode = 1
    return
  }
  const issues: ContentIssue[] = []
  try {
    const snapshot = await loadNotionPublishedSnapshot(config, { onIssue: (issue) => issues.push(issue) })
    console.log(JSON.stringify({
      status: issues.length ? "partial" : "ok",
      checkedAt: snapshot.generatedAt,
      published: { articles: snapshot.articles.length, events: snapshot.events.length, media: snapshot.media.length },
      issues,
    }, null, 2))
    if (issues.length) process.exitCode = 1
  } catch {
    console.error(JSON.stringify({ status: "failed", issues, action: "Check Notion integration permissions, source schemas and connection. No snapshot was written." }, null, 2))
    process.exitCode = 1
  }
}

void main()

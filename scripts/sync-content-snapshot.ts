import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import {
  getNotionContentConfig,
  loadNotionPublishedSnapshot,
} from "../src/content/notion-repository"

async function main() {
  const config = getNotionContentConfig()

  if (!config) {
    throw new Error(
      "Notion content is not fully configured. See .env.example for required data-source IDs.",
    )
  }

  const snapshot = await loadNotionPublishedSnapshot(config)
  const outputPath = resolve(process.cwd(), "src/content/snapshot.json")

  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")

  console.log(
    `Validated and saved ${snapshot.events.length} events, ${snapshot.media.length} media items, and ${snapshot.articles.length} articles.`,
  )
}

void main()

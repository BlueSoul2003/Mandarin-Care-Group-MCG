import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  timeoutMs: 5000,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

const DATABASE_ID = process.env.NOTION_DATABASE_ID

export interface ArticleMeta {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
  tags: string[]
  category: "lifestyle" | "spiritual"
}

// Map Notion properties to our ArticleMeta
const getPageMetaData = (post: any): ArticleMeta => {
  const getTags = (tags: any[]) => {
    return tags.map((tag) => tag.name)
  }

  return {
    id: post.id,
    title: post.properties.Title?.title[0]?.plain_text || "Untitled",
    slug: post.properties.Slug?.rich_text[0]?.plain_text || post.id,
    excerpt: post.properties.Excerpt?.rich_text[0]?.plain_text || "點擊閱讀完整文章...",
    date: post.properties.Date?.date?.start || post.created_time.substring(0, 10),
    author: post.properties.Author?.rich_text[0]?.plain_text || "MCG Team",
    tags: getTags(post.properties.Tags?.multi_select || []),
    category: "lifestyle",
  }
}

export const getLifestyleArticles = async (): Promise<ArticleMeta[]> => {
  if (!DATABASE_ID) return []

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      // You can add a filter here if you use the same DB for different categories
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    })

    return response.results.map((post) => getPageMetaData(post))
  } catch (error) {
    console.error("Error fetching lifestyle articles:", error)
    return []
  }
}

export const getArticleContent = async (slug: string) => {
  if (!DATABASE_ID) return null

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    })

    if (response.results.length === 0) return null

    const page = response.results[0]
    const metadata = getPageMetaData(page)
    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const mdString = n2m.toMarkdownString(mdBlocks)

    return {
      metadata,
      markdown: mdString.parent,
    }
  } catch (error) {
    console.error("Error fetching article content:", error)
    return null
  }
}

export interface GalleryImage {
  id: string
  title: string
  url: string
  date: string
  tags: string[]
  type: "image" | "video"
}

const GALLERY_DB_ID = process.env.NOTION_GALLERY_DATABASE_ID

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  if (!GALLERY_DB_ID) return []

  const response = await notion.databases.query({
    database_id: GALLERY_DB_ID,
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  })

  return response.results.map((post: any) => {
    const getTags = (tags: any[]) => tags.map((tag) => tag.name)
    
    // Support Notion's URL property or simple text property
    let imgUrl = ""
    if (post.properties.ImageURL?.url) {
      imgUrl = post.properties.ImageURL.url
    } else if (post.properties.ImageURL?.rich_text) {
      imgUrl = post.properties.ImageURL.rich_text[0]?.plain_text || ""
    }
    
    // Determine if it's a video based on URL extension or Cloudinary video path
    const isVideo = imgUrl.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/i) || imgUrl.includes("/video/upload/")
    const type = isVideo ? "video" : "image"

    return {
      id: post.id,
      title: post.properties.Title?.title[0]?.plain_text || "Untitled",
      url: imgUrl,
      date: post.properties.Date?.date?.start || post.created_time.substring(0, 10),
      tags: getTags(post.properties.Tags?.multi_select || []),
      type,
    }
  })
}

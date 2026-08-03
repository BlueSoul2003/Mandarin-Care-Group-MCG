import { z } from "zod"

const id = z.string().trim().min(1)
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const published = z.literal("Published")
const cloudinaryUrl = z
  .string()
  .url()
  .refine(
    (value) => new URL(value).hostname === "res.cloudinary.com",
    "Published media must use res.cloudinary.com",
  )

export const publishingStatusSchema = z.enum([
  "Draft",
  "Review",
  "Published",
  "Archived",
])

export const termSchema = z.object({
  id,
  slug,
  name: z.string().trim().min(1),
  startDate: isoDate,
  endDate: isoDate,
  status: published,
})

export const seriesSchema = z.object({
  id,
  slug,
  name: z.string().trim().min(1),
  summary: z.string().trim(),
  status: published,
})

export const personSchema = z.object({
  id,
  slug,
  name: z.string().trim().min(1),
  portraitUrl: cloudinaryUrl.optional(),
  bio: z.string().trim().optional(),
  status: published,
})

export const committeeRoleSchema = z.object({
  id,
  personId: id,
  termId: id,
  title: z.string().trim().min(1),
  sortOrder: z.number().int().nonnegative(),
  status: published,
})

export const eventSchema = z.object({
  id,
  slug,
  title: z.string().trim().min(1),
  summary: z.string().trim(),
  startDate: isoDate,
  endDate: isoDate.optional(),
  location: z.string().trim().optional(),
  termId: id,
  seriesId: id.optional(),
  coverImageUrl: cloudinaryUrl.optional(),
  featured: z.boolean(),
  status: published,
})

export const mediaItemSchema = z.object({
  id,
  eventId: id,
  title: z.string().trim().min(1),
  url: cloudinaryUrl,
  alt: z.string().trim().min(1),
  takenAt: isoDate,
  type: z.enum(["image", "video"]),
  sortOrder: z.number().int().nonnegative(),
  status: published,
})

export const articleSchema = z.object({
  id,
  slug,
  title: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  publishedAt: isoDate,
  authorName: z.string().trim().min(1),
  section: z.enum(["lifestyle", "spiritual", "community", "news"]),
  tags: z.array(z.string().trim().min(1)),
  eventIds: z.array(id),
  contentMarkdown: z.string().trim().min(1),
  status: published,
})

export const publishedContentSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedAt: z.string().datetime({ offset: true }),
    terms: z.array(termSchema),
    series: z.array(seriesSchema),
    people: z.array(personSchema),
    committeeRoles: z.array(committeeRoleSchema),
    events: z.array(eventSchema),
    media: z.array(mediaItemSchema),
    articles: z.array(articleSchema),
  })
  .superRefine((snapshot, context) => {
    const validateUnique = (
      values: Array<{ id: string; slug?: string }>,
      collection: string,
    ) => {
      const ids = new Set<string>()
      const slugs = new Set<string>()

      values.forEach((value, index) => {
        if (ids.has(value.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate id in ${collection}: ${value.id}`,
            path: [collection, index, "id"],
          })
        }
        ids.add(value.id)

        if (value.slug) {
          if (slugs.has(value.slug)) {
            context.addIssue({
              code: "custom",
              message: `Duplicate slug in ${collection}: ${value.slug}`,
              path: [collection, index, "slug"],
            })
          }
          slugs.add(value.slug)
        }
      })
    }

    validateUnique(snapshot.terms, "terms")
    validateUnique(snapshot.series, "series")
    validateUnique(snapshot.people, "people")
    validateUnique(snapshot.committeeRoles, "committeeRoles")
    validateUnique(snapshot.events, "events")
    validateUnique(snapshot.media, "media")
    validateUnique(snapshot.articles, "articles")

    const termIds = new Set(snapshot.terms.map((term) => term.id))
    const seriesIds = new Set(snapshot.series.map((item) => item.id))
    const personIds = new Set(snapshot.people.map((person) => person.id))
    const eventIds = new Set(snapshot.events.map((event) => event.id))

    snapshot.events.forEach((event, index) => {
      if (!termIds.has(event.termId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown termId: ${event.termId}`,
          path: ["events", index, "termId"],
        })
      }
      if (event.seriesId && !seriesIds.has(event.seriesId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown seriesId: ${event.seriesId}`,
          path: ["events", index, "seriesId"],
        })
      }
    })

    snapshot.committeeRoles.forEach((role, index) => {
      if (!termIds.has(role.termId) || !personIds.has(role.personId)) {
        context.addIssue({
          code: "custom",
          message: "Committee role must reference a published term and person",
          path: ["committeeRoles", index],
        })
      }
    })

    const mediaCounts = new Map<string, number>()
    snapshot.media.forEach((item, index) => {
      if (!eventIds.has(item.eventId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown eventId: ${item.eventId}`,
          path: ["media", index, "eventId"],
        })
      }
      mediaCounts.set(item.eventId, (mediaCounts.get(item.eventId) ?? 0) + 1)
    })

    mediaCounts.forEach((count, eventId) => {
      if (count > 30) {
        context.addIssue({
          code: "custom",
          message: `Event ${eventId} has ${count} public media items; maximum is 30`,
          path: ["media"],
        })
      }
    })

    snapshot.articles.forEach((article, index) => {
      article.eventIds.forEach((eventId) => {
        if (!eventIds.has(eventId)) {
          context.addIssue({
            code: "custom",
            message: `Unknown eventId: ${eventId}`,
            path: ["articles", index, "eventIds"],
          })
        }
      })
    })
  })

export type PublishingStatus = z.infer<typeof publishingStatusSchema>
export type Term = z.infer<typeof termSchema>
export type Series = z.infer<typeof seriesSchema>
export type Person = z.infer<typeof personSchema>
export type CommitteeRole = z.infer<typeof committeeRoleSchema>
export type Event = z.infer<typeof eventSchema>
export type MediaItem = z.infer<typeof mediaItemSchema>
export type Article = z.infer<typeof articleSchema>
export type PublishedContentSnapshot = z.infer<
  typeof publishedContentSnapshotSchema
>

export function parsePublishedContentSnapshot(
  value: unknown,
): PublishedContentSnapshot {
  return publishedContentSnapshotSchema.parse(value)
}

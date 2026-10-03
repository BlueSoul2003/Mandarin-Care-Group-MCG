export interface ContentIssue {
  collection: "articles"
  pageId: string
  code: "INVALID_FIELDS" | "DUPLICATE_SLUG" | "BODY_UNAVAILABLE" | "INVALID_BODY"
  fields?: string[]
}

export function reportContentIssue(issue: ContentIssue) {
  // Only identifiers and field names; never log bodies, tokens or raw SDK errors.
  console.warn("[MCG content] Article skipped", issue)
}

export class ArticleValidationError extends Error {
  constructor(readonly issueCount: number) {
    super(`${issueCount} article(s) failed validation; snapshot was not saved.`)
  }
}

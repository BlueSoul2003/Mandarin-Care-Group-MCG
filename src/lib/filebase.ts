import "server-only"

import { S3Client } from "@aws-sdk/client-s3"

export class FilebaseConfigurationError extends Error {
  readonly missingVariables: string[]

  constructor(missingVariables: string[]) {
    super(`Missing Filebase environment variables: ${missingVariables.join(", ")}`)
    this.name = "FilebaseConfigurationError"
    this.missingVariables = missingVariables
  }
}

type FilebaseConnection = {
  bucket: string
  client: S3Client
}

let cachedConnection: FilebaseConnection | null = null
let cachedSignature = ""

function firstConfiguredValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }

  return undefined
}

export function getFilebaseConnection(): FilebaseConnection {
  const accessKeyId = firstConfiguredValue("FILEBASE_ACCESS_KEY", "FILEBASE_KEY")
  const secretAccessKey = firstConfiguredValue("FILEBASE_SECRET_KEY", "FILEBASE_SECRET")
  const bucket = firstConfiguredValue("FILEBASE_BUCKET")
  const endpoint =
    firstConfiguredValue("FILEBASE_ENDPOINT") || "https://s3.filebase.io"
  const region =
    firstConfiguredValue("FILEBASE_REGION") ||
    (endpoint.includes("s3.filebase.com") ? "us-east-1" : "auto")

  const missingVariables: string[] = []
  if (!accessKeyId) {
    missingVariables.push("FILEBASE_ACCESS_KEY (or FILEBASE_KEY)")
  }
  if (!secretAccessKey) {
    missingVariables.push("FILEBASE_SECRET_KEY (or FILEBASE_SECRET)")
  }
  if (!bucket) {
    missingVariables.push("FILEBASE_BUCKET")
  }

  if (!accessKeyId || !secretAccessKey || !bucket) {
    throw new FilebaseConfigurationError(missingVariables)
  }

  const signature = [endpoint, region, bucket, accessKeyId, secretAccessKey].join("\n")
  if (cachedConnection && cachedSignature === signature) {
    return cachedConnection
  }

  cachedConnection = {
    bucket,
    client: new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  }
  cachedSignature = signature

  return cachedConnection
}

export function getS3ErrorName(error: unknown) {
  if (!error || typeof error !== "object") return undefined

  const candidate = error as {
    name?: unknown
    Code?: unknown
    code?: unknown
  }

  for (const value of [candidate.name, candidate.Code, candidate.code]) {
    if (typeof value === "string" && value) return value
  }

  return undefined
}

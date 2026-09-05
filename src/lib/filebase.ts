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
  const bucket = firstConfiguredValue("FILEBASE_BUCKET") || "taize-audio"
  const endpoint = firstConfiguredValue("FILEBASE_ENDPOINT") || "https://s3.filebase.io"

  const missingVariables: string[] = []
  if (!accessKeyId) {
    missingVariables.push("FILEBASE_ACCESS_KEY (or FILEBASE_KEY)")
  }
  if (!secretAccessKey) {
    missingVariables.push("FILEBASE_SECRET_KEY (or FILEBASE_SECRET)")
  }

  if (!accessKeyId || !secretAccessKey) {
    throw new FilebaseConfigurationError(missingVariables)
  }

  const signature = [endpoint, bucket, accessKeyId, secretAccessKey].join("\n")
  if (cachedConnection && cachedSignature === signature) {
    return cachedConnection
  }

  cachedConnection = {
    bucket,
    client: new S3Client({
      endpoint,
      region: "auto",
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  }
  cachedSignature = signature

  return cachedConnection
}

export function getS3ErrorName(error: unknown): string | undefined {
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

export const FILEBASE_BUCKET = process.env.FILEBASE_BUCKET || "taize-audio"

export const filebaseS3 = new S3Client({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.io",
  region: "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY || "",
    secretAccessKey: process.env.FILEBASE_SECRET_KEY || "",
  },
})

import { S3Client } from "@aws-sdk/client-s3"

export const filebaseS3 = new S3Client({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.io",
  region: "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY || "",
    secretAccessKey: process.env.FILEBASE_SECRET_KEY || "",
  },
})

export const FILEBASE_BUCKET = process.env.FILEBASE_BUCKET || "taize-audio"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { badRequest, AppError } from "../utils/apiError";
import { logger } from "../logger";
import path from "path";

// Initialize S3 Client if configured
let s3Client: S3Client | null = null;

if (env.UPLOAD_PROVIDER === "s3" && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_REGION) {
  s3Client = new S3Client({
    region: env.AWS_S3_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: env.AWS_S3_ENDPOINT,
    forcePathStyle: true, // required for some S3-compatible providers like Supabase Storage
  });
}

/**
 * Upload a file to the configured storage provider (currently only S3/Supabase is supported).
 * @param fileBuffer The raw file buffer
 * @param mimeType The file mime type
 * @param originalName The original file name
 * @param folder The folder to upload into (e.g. "posts")
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  fileBuffer: Buffer,
  mimeType: string,
  originalName: string,
  folder: string = "uploads"
): Promise<string> {
  if (env.UPLOAD_PROVIDER !== "s3" || !s3Client) {
    throw badRequest("S3 Upload is not configured on this server");
  }

  try {
    const ext = path.extname(originalName) || ".bin";
    const filename = `${folder}/${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: filename,
      Body: fileBuffer,
      ContentType: mimeType,
      // For Supabase, ACL public-read is typically not supported via putObject if policies handle it,
      // but let's try without ACL first, relying on bucket public settings.
    });

    await s3Client.send(command);

    // Construct the public URL (for Supabase storage)
    // AWS_S3_ENDPOINT is usually something like https://[ref].supabase.co/storage/v1/s3
    // The public URL for a Supabase bucket is typically:
    // https://[ref].supabase.co/storage/v1/object/public/[bucket]/[key]
    
    if (env.AWS_S3_ENDPOINT?.includes('supabase.co')) {
      const baseUrl = env.AWS_S3_ENDPOINT.replace('/s3', '/object/public');
      return `${baseUrl}/${env.AWS_S3_BUCKET}/${filename}`;
    }

    // Default S3 URL
    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${filename}`;
  } catch (error) {
    logger.error({ error, folder, originalName }, "Failed to upload file to S3");
    throw new AppError("UPLOAD_FAILED", "Failed to upload file", 500);
  }
}

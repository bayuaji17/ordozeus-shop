import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 Client Configuration
 *
 * Uses AWS SDK S3 client configured for Cloudflare R2
 */

// Validate required environment variables
const requiredEnvVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Configure S3Client for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

/**
 * Generate a unique key for an image
 * Format: products/{productId}/{timestamp}-{randomId}-{filename}
 */
export function generateImageKey(
  productId: string,
  filename: string,
  variant: "original" | "thumbnail" = "original"
): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const sanitizedFilename = filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();

  const prefix = variant === "thumbnail" ? "thumb_" : "";

  return `products/${productId}/${timestamp}-${randomId}-${prefix}${sanitizedFilename}`;
}

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Return public URL
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to R2");
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw new Error("Failed to delete file from R2");
  }
}

/**
 * Delete multiple files from R2
 */
export async function deleteManyFromR2(keys: string[]): Promise<void> {
  try {
    await Promise.all(keys.map((key) => deleteFromR2(key)));
  } catch (error) {
    console.error("Error deleting multiple files from R2:", error);
    throw new Error("Failed to delete files from R2");
  }
}

/**
 * Get public URL for an R2 object
 */
export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

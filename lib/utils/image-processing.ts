import sharp from "sharp";

/**
 * Image Processing Utilities using Sharp
 *
 * Handles image optimization, conversion to WebP, and thumbnail generation
 */

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number; // bytes
  format: string;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  format?: "webp" | "jpeg" | "png";
}

/**
 * Optimize and convert image to WebP format
 *
 * @param buffer - Original image buffer
 * @param options - Processing options
 * @returns Processed image data
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 85,
    format = "webp",
  } = options;

  try {
    let image = sharp(buffer);

    // Get metadata
    const metadata = await image.metadata();

    // Resize if needed
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > maxWidth || metadata.height > maxHeight)
    ) {
      image = image.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Convert to target format
    let processedBuffer: Buffer;

    if (format === "webp") {
      processedBuffer = await image
        .webp({ quality, effort: 6 })
        .toBuffer();
    } else if (format === "jpeg") {
      processedBuffer = await image
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    } else {
      processedBuffer = await image
        .png({ quality, compressionLevel: 9 })
        .toBuffer();
    }

    // Get final metadata
    const processedMetadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
      size: processedBuffer.length,
      format: processedMetadata.format || format,
    };
  } catch (error) {
    console.error("Error optimizing image:", error);
    throw new Error("Failed to optimize image");
  }
}

/**
 * Generate thumbnail from image
 *
 * @param buffer - Original image buffer
 * @param size - Thumbnail size (width & height)
 * @returns Thumbnail image data
 */
export async function generateThumbnail(
  buffer: Buffer,
  size: number = 300
): Promise<ProcessedImage> {
  try {
    const thumbnailBuffer = await sharp(buffer)
      .resize(size, size, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toBuffer();

    const metadata = await sharp(thumbnailBuffer).metadata();

    return {
      buffer: thumbnailBuffer,
      width: metadata.width || size,
      height: metadata.height || size,
      size: thumbnailBuffer.length,
      format: "webp",
    };
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw new Error("Failed to generate thumbnail");
  }
}

/**
 * Extract image metadata
 */
export async function getImageMetadata(buffer: Buffer) {
  try {
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
      size: buffer.length,
      hasAlpha: metadata.hasAlpha || false,
      orientation: metadata.orientation,
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    throw new Error("Failed to extract image metadata");
  }
}

/**
 * Validate image file
 *
 * @param buffer - Image buffer
 * @param maxSize - Maximum file size in bytes
 * @returns true if valid
 */
export async function validateImage(
  buffer: Buffer,
  maxSize: number = 5 * 1024 * 1024 // 5MB default
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check file size
    if (buffer.length > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      };
    }

    // Try to parse with sharp
    const metadata = await sharp(buffer).metadata();

    // Check if it's a valid image format
    const validFormats = ["jpeg", "jpg", "png", "webp"];
    if (!metadata.format || !validFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: "Invalid image format. Only JPG, PNG, and WebP are allowed",
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Invalid image file or corrupted data",
    };
  }
}

/**
 * Convert any image format to WebP
 */
export async function convertToWebP(
  buffer: Buffer,
  quality: number = 85
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .webp({ quality, effort: 6 })
      .toBuffer();
  } catch (error) {
    console.error("Error converting to WebP:", error);
    throw new Error("Failed to convert image to WebP");
  }
}

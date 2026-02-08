import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { productImages, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadToR2, generateImageKey } from "@/lib/r2";
import { optimizeImage, generateThumbnail, validateImage } from "@/lib/utils/image-processing";
import { IMAGE_VALIDATION } from "@/lib/validations/product-images";

/**
 * POST /api/products/images
 * Upload product images
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const files = formData.getAll("files") as File[];

    // Validate product ID
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check file count
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > IMAGE_VALIDATION.MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Maximum ${IMAGE_VALIDATION.MAX_IMAGES_PER_PRODUCT} images allowed` },
        { status: 400 }
      );
    }

    // Check total image count
    const existingImages = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
    });

    if (existingImages.length + files.length > IMAGE_VALIDATION.MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        {
          error: `Product already has ${existingImages.length} images. Maximum ${IMAGE_VALIDATION.MAX_IMAGES_PER_PRODUCT} images allowed per product.`,
        },
        { status: 400 }
      );
    }

    // Process and upload images
    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Validate image
        const validation = await validateImage(buffer, IMAGE_VALIDATION.MAX_FILE_SIZE);
        if (!validation.valid) {
          errors.push({
            fileName: file.name,
            error: validation.error,
          });
          continue;
        }

        // Optimize and convert to WebP
        const optimized = await optimizeImage(buffer, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 85,
          format: "webp",
        });

        // Generate thumbnail
        const thumbnail = await generateThumbnail(buffer, 300);

        // Generate unique keys
        const originalKey = generateImageKey(productId, `${file.name}.webp`, "original");
        const thumbnailKey = generateImageKey(productId, `${file.name}.webp`, "thumbnail");

        // Upload to R2
        const [originalUrl, thumbnailUrl] = await Promise.all([
          uploadToR2(optimized.buffer, originalKey, "image/webp"),
          uploadToR2(thumbnail.buffer, thumbnailKey, "image/webp"),
        ]);

        // Determine display order
        const maxOrder = existingImages.length > 0
          ? Math.max(...existingImages.map(img => img.displayOrder))
          : -1;
        const displayOrder = maxOrder + i + 1;

        // Determine if this should be the primary image
        const isPrimary = existingImages.length === 0 && i === 0;

        // Save to database
        const [savedImage] = await db
          .insert(productImages)
          .values({
            productId,
            url: originalUrl,
            key: originalKey,
            fileName: file.name,
            fileSize: optimized.size,
            mimeType: "image/webp",
            width: optimized.width,
            height: optimized.height,
            displayOrder,
            isPrimary,
          })
          .returning();

        uploadedImages.push({
          ...savedImage,
          thumbnailUrl,
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : "Failed to process image",
        });
      }
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToR2, generateImageKey } from "@/lib/r2";
import { optimizeImage, validateImage } from "@/lib/utils/image-processing";
import { CAROUSEL_VALIDATION } from "@/lib/validations/carousel";

/**
 * POST /api/carousel/upload
 * Upload carousel image
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log(session, "session");
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const carouselId = formData.get("carouselId") as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image
    const validation = await validateImage(
      buffer,
      CAROUSEL_VALIDATION.MAX_IMAGE_SIZE,
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Optimize and convert to WebP
    // For carousel images, use larger max dimensions (1920x1080)
    const optimized = await optimizeImage(buffer, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 90, // Higher quality for hero images
      format: "webp",
    });

    // Generate unique key
    const uniqueId = carouselId || `temp-${Date.now()}`;
    const imageKey = generateImageKey(uniqueId, `${file.name}.webp`);

    // Use carousel-specific path
    const carouselKey = imageKey.replace("products/", "carousel/");

    // Upload to R2
    const imageUrl = await uploadToR2(
      optimized.buffer,
      carouselKey,
      "image/webp",
    );

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        key: carouselKey,
        width: optimized.width,
        height: optimized.height,
        size: optimized.size,
        format: optimized.format,
      },
    });
  } catch (error) {
    console.error("Error uploading carousel image:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/carousel/upload
 * Delete carousel image from R2
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageKey = searchParams.get("key");

    if (!imageKey) {
      return NextResponse.json(
        { error: "Image key is required" },
        { status: 400 },
      );
    }

    // Import deleteFromR2 here to avoid circular dependency
    const { deleteFromR2 } = await import("@/lib/r2");
    await deleteFromR2(imageKey);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting carousel image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToR2, generateImageKey } from "@/lib/r2";
import { optimizeImage, validateImage } from "@/lib/utils/image-processing";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * POST /api/categories/upload
 * Upload category image
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = await validateImage(buffer, MAX_IMAGE_SIZE);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const optimized = await optimizeImage(buffer, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 85,
      format: "webp",
    });

    const uniqueId = categoryId || `temp-${Date.now()}`;
    const imageKey = generateImageKey(uniqueId, `${file.name}.webp`);
    const categoryKey = imageKey.replace("products/", "categories/");

    const imageUrl = await uploadToR2(
      optimized.buffer,
      categoryKey,
      "image/webp"
    );

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        key: categoryKey,
        width: optimized.width,
        height: optimized.height,
        size: optimized.size,
        format: optimized.format,
      },
    });
  } catch (error) {
    console.error("Error uploading category image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/upload
 * Delete category image from R2
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageKey = searchParams.get("key");

    if (!imageKey) {
      return NextResponse.json(
        { error: "Image key is required" },
        { status: 400 }
      );
    }

    const { deleteFromR2 } = await import("@/lib/r2");
    await deleteFromR2(imageKey);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting category image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

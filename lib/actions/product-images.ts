"use server";

import { db } from "@/lib/db";
import { productImages } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  setPrimaryImageSchema,
  updateImageOrderSchema,
  updateImageAltTextSchema,
  deleteImageSchema,
  type SetPrimaryImageFormData,
  type UpdateImageOrderFormData,
  type UpdateImageAltTextFormData,
  type DeleteImageFormData,
} from "@/lib/validations/product-images";
import { deleteFromR2 } from "@/lib/r2";
import { requireAdmin } from "@/lib/auth/server";

/**
 * Get all images for a product
 */
export async function getProductImages(productId: string) {
  try {
    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
      orderBy: [productImages.displayOrder, desc(productImages.createdAt)],
    });

    return images;
  } catch (error) {
    console.error("Error fetching product images:", error);
    throw new Error("Failed to fetch product images");
  }
}

/**
 * Set an image as the primary image for a product
 */
export async function setPrimaryImage(data: SetPrimaryImageFormData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = setPrimaryImageSchema.parse(data);

    await db.transaction(async (tx) => {
      // Verify the image belongs to the product
      const image = await tx.query.productImages.findFirst({
        where: and(
          eq(productImages.id, validatedData.imageId),
          eq(productImages.productId, validatedData.productId)
        ),
      });

      if (!image) {
        throw new Error("Image not found or does not belong to this product");
      }

      // Unset all other images as primary
      await tx
        .update(productImages)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(eq(productImages.productId, validatedData.productId));

      // Set the selected image as primary
      await tx
        .update(productImages)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(eq(productImages.id, validatedData.imageId));
    });

    revalidatePath(`/admin/products/${data.productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error setting primary image:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to set primary image",
    };
  }
}

/**
 * Update the display order of images
 */
export async function updateImageOrder(data: UpdateImageOrderFormData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = updateImageOrderSchema.parse(data);

    await db.transaction(async (tx) => {
      // Update each image's display order
      for (const { imageId, displayOrder } of validatedData.imageOrders) {
        await tx
          .update(productImages)
          .set({ displayOrder, updatedAt: new Date() })
          .where(
            and(
              eq(productImages.id, imageId),
              eq(productImages.productId, validatedData.productId)
            )
          );
      }
    });

    revalidatePath(`/admin/products/${data.productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating image order:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update image order",
    };
  }
}

/**
 * Update image alt text
 */
export async function updateImageAltText(data: UpdateImageAltTextFormData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = updateImageAltTextSchema.parse(data);

    await db
      .update(productImages)
      .set({
        altText: validatedData.altText || null,
        updatedAt: new Date()
      })
      .where(eq(productImages.id, validatedData.imageId));

    revalidatePath(`/admin/products`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating image alt text:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update image alt text",
    };
  }
}

/**
 * Delete a product image
 */
export async function deleteProductImage(data: DeleteImageFormData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = deleteImageSchema.parse(data);

    let deletedImage: typeof productImages.$inferSelect | undefined;

    await db.transaction(async (tx) => {
      // Get the image to delete
      const image = await tx.query.productImages.findFirst({
        where: and(
          eq(productImages.id, validatedData.imageId),
          eq(productImages.productId, validatedData.productId)
        ),
      });

      if (!image) {
        throw new Error("Image not found or does not belong to this product");
      }

      deletedImage = image;

      // Delete from database
      await tx
        .delete(productImages)
        .where(eq(productImages.id, validatedData.imageId));

      // If this was the primary image, set the first remaining image as primary
      if (image.isPrimary) {
        const remainingImages = await tx.query.productImages.findMany({
          where: eq(productImages.productId, validatedData.productId),
          orderBy: [productImages.displayOrder],
          limit: 1,
        });

        if (remainingImages.length > 0) {
          await tx
            .update(productImages)
            .set({ isPrimary: true, updatedAt: new Date() })
            .where(eq(productImages.id, remainingImages[0].id));
        }
      }
    });

    // Delete from R2 storage
    if (deletedImage) {
      try {
        await deleteFromR2(deletedImage.key);
      } catch (r2Error) {
        console.error("Error deleting from R2 (continuing):", r2Error);
        // Don't fail the operation if R2 delete fails
      }
    }

    revalidatePath(`/admin/products/${data.productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting product image:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to delete product image",
    };
  }
}

/**
 * Get the count of images for a product
 */
export async function getProductImageCount(productId: string): Promise<number> {
  try {
    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
    });

    return images.length;
  } catch (error) {
    console.error("Error getting image count:", error);
    return 0;
  }
}

/**
 * Get primary image for a product
 */
export async function getPrimaryImage(productId: string) {
  try {
    const image = await db.query.productImages.findFirst({
      where: and(
        eq(productImages.productId, productId),
        eq(productImages.isPrimary, true)
      ),
    });

    return image || null;
  } catch (error) {
    console.error("Error fetching primary image:", error);
    return null;
  }
}

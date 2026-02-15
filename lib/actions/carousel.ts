"use server";

import { db } from "@/lib/db";
import { carousels } from "@/lib/db/schema";
import { eq, and, or, like, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  carouselSchema,
  updateCarouselOrderSchema,
  toggleCarouselStatusSchema,
  deleteCarouselSchema,
  type CarouselFormData,
  type UpdateCarouselOrderData,
  type ToggleCarouselStatusData,
  type DeleteCarouselData,
} from "@/lib/validations/carousel";
import { deleteFromR2 } from "@/lib/r2";
import { requireAdmin } from "@/lib/auth/server";

export type CarouselStatus = "active" | "inactive" | "scheduled";

export interface CarouselFilters {
  search?: string;
  status?: "all" | CarouselStatus;
  sortBy?: "order" | "title" | "created";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Get all carousel items with filters
 */
export async function getCarouselItems(filters: CarouselFilters = {}) {
  try {
    const {
      search = "",
      status = "all",
      sortBy = "order",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = filters;

    const offset = (page - 1) * limit;

    // Build the base query
    let query = db.select().from(carousels).$dynamic();

    // Apply filters
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(carousels.title, `%${search}%`),
          like(carousels.subtitle, `%${search}%`),
          like(carousels.description, `%${search}%`),
        ),
      );
    }

    // Status filter
    if (status !== "all") {
      conditions.push(eq(carousels.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderByColumn =
      sortBy === "title"
        ? carousels.title
        : sortBy === "created"
          ? carousels.createdAt
          : carousels.displayOrder;

    const orderDirection = sortOrder === "asc" ? asc : desc;
    query = query.orderBy(orderDirection(orderByColumn));

    // Get total count for pagination
    const allResults = await query;
    const total = allResults.length;

    // Apply pagination
    const items = allResults.slice(offset, offset + limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching carousel items:", error);
    throw new Error("Failed to fetch carousel items");
  }
}

/**
 * Get active carousel items for public display
 */
export async function getActiveCarouselItems() {
  try {
    const now = new Date();

    const items = await db
      .select()
      .from(carousels)
      .where(eq(carousels.status, "active"))
      .orderBy(asc(carousels.displayOrder));

    // Filter by date range (scheduled items)
    const activeItems = items.filter((item) => {
      // If startDate is set and hasn't arrived yet, skip
      if (item.startDate && now < item.startDate) return false;

      // If endDate is set and has passed, skip
      if (item.endDate && now > item.endDate) return false;

      return true;
    });

    return activeItems;
  } catch (error) {
    console.error("Error fetching active carousel items:", error);
    throw new Error("Failed to fetch active carousel items");
  }
}

/**
 * Get single carousel item by ID
 */
export async function getCarouselById(id: string) {
  try {
    const carousel = await db.query.carousels.findFirst({
      where: eq(carousels.id, id),
    });

    return carousel || null;
  } catch (error) {
    console.error("Error fetching carousel item:", error);
    throw new Error("Failed to fetch carousel item");
  }
}

/**
 * Create new carousel item
 */
export async function createCarousel(data: CarouselFormData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = carouselSchema.parse(data);

    if (!validatedData.imageUrl || !validatedData.imageKey) {
      return {
        success: false,
        error: "Carousel image is required",
      };
    }

    // Get the highest display order
    const maxOrderResult = await db
      .select({ maxOrder: carousels.displayOrder })
      .from(carousels)
      .orderBy(desc(carousels.displayOrder))
      .limit(1);

    const nextOrder =
      maxOrderResult.length > 0 ? (maxOrderResult[0].maxOrder || 0) + 1 : 0;

    const createPayload = {
      title: validatedData.title,
      subtitle: validatedData.subtitle ?? null,
      description: validatedData.description ?? null,
      imageUrl: validatedData.imageUrl,
      imageKey: validatedData.imageKey,
      ctaText: validatedData.ctaText ?? null,
      ctaLink: validatedData.ctaLink || null,
      displayOrder: nextOrder,
      status: validatedData.status,
      startDate: validatedData.startDate ?? null,
      endDate: validatedData.endDate ?? null,
      backgroundColor: validatedData.backgroundColor ?? null,
      textColor: validatedData.textColor ?? null,
    } satisfies typeof carousels.$inferInsert;

    // Create carousel
    const [newCarousel] = await db
      .insert(carousels)
      .values(createPayload)
      .returning();

    revalidatePath("/admin/carousel");

    return {
      success: true,
      data: newCarousel,
    };
  } catch (error) {
    console.error("Error creating carousel:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create carousel item",
    };
  }
}

/**
 * Update existing carousel item
 */
export async function updateCarousel(id: string, data: CarouselFormData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = carouselSchema.parse(data);

    if (!validatedData.imageUrl || !validatedData.imageKey) {
      return {
        success: false,
        error: "Carousel image is required",
      };
    }

    // Check if carousel exists
    const existing = await getCarouselById(id);
    if (!existing) {
      return {
        success: false,
        error: "Carousel item not found",
      };
    }

    const updatePayload = {
      title: validatedData.title,
      subtitle: validatedData.subtitle ?? null,
      description: validatedData.description ?? null,
      imageUrl: validatedData.imageUrl,
      imageKey: validatedData.imageKey,
      ctaText: validatedData.ctaText ?? null,
      ctaLink: validatedData.ctaLink || null,
      status: validatedData.status,
      startDate: validatedData.startDate ?? null,
      endDate: validatedData.endDate ?? null,
      backgroundColor: validatedData.backgroundColor ?? null,
      textColor: validatedData.textColor ?? null,
      updatedAt: new Date(),
    };

    // Update carousel
    const [updatedCarousel] = await db
      .update(carousels)
      .set(updatePayload)
      .where(eq(carousels.id, id))
      .returning();

    revalidatePath("/admin/carousel");
    revalidatePath(`/admin/carousel/${id}`);

    return {
      success: true,
      data: updatedCarousel,
    };
  } catch (error) {
    console.error("Error updating carousel:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update carousel item",
    };
  }
}

/**
 * Delete carousel item
 */
export async function deleteCarousel(data: DeleteCarouselData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = deleteCarouselSchema.parse(data);

    // Get carousel to delete
    const carousel = await getCarouselById(validatedData.id);
    if (!carousel) {
      return {
        success: false,
        error: "Carousel item not found",
      };
    }

    // Delete from database
    await db.delete(carousels).where(eq(carousels.id, validatedData.id));

    // Delete image from R2 storage
    if (carousel.imageKey) {
      try {
        await deleteFromR2(carousel.imageKey);
      } catch (r2Error) {
        console.error("Error deleting from R2 (continuing):", r2Error);
        // Don't fail the operation if R2 delete fails
      }
    }

    revalidatePath("/admin/carousel");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting carousel:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to delete carousel item",
    };
  }
}

/**
 * Update carousel display order
 */
export async function updateCarouselOrder(data: UpdateCarouselOrderData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = updateCarouselOrderSchema.parse(data);

    // Update each carousel's display order
    await db.transaction(async (tx) => {
      for (const { id, displayOrder } of validatedData.carouselOrders) {
        await tx
          .update(carousels)
          .set({ displayOrder, updatedAt: new Date() })
          .where(eq(carousels.id, id));
      }
    });

    revalidatePath("/admin/carousel");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating carousel order:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update carousel order",
    };
  }
}

/**
 * Toggle carousel status
 */
export async function toggleCarouselStatus(data: ToggleCarouselStatusData) {
  await requireAdmin();
  try {
    // Validate input
    const validatedData = toggleCarouselStatusSchema.parse(data);

    // Update status
    const [updatedCarousel] = await db
      .update(carousels)
      .set({
        status: validatedData.status,
        updatedAt: new Date(),
      })
      .where(eq(carousels.id, validatedData.id))
      .returning();

    revalidatePath("/admin/carousel");

    return {
      success: true,
      data: updatedCarousel,
    };
  } catch (error) {
    console.error("Error toggling carousel status:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to toggle carousel status",
    };
  }
}

/**
 * Get carousel statistics
 */
export async function getCarouselStats() {
  try {
    const allCarousels = await db.select().from(carousels);

    const stats = {
      total: allCarousels.length,
      active: allCarousels.filter((c) => c.status === "active").length,
      inactive: allCarousels.filter((c) => c.status === "inactive").length,
      scheduled: allCarousels.filter((c) => c.status === "scheduled").length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching carousel stats:", error);
    throw new Error("Failed to fetch carousel statistics");
  }
}

"use server";

import { db } from "@/lib/db";
import { sizes, sizeTypes, productSizes } from "@/lib/db/schema";
import { eq, and, ne, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";

/**
 * Get all sizes from the master table, ordered by type sortOrder then size sortOrder
 */
export async function getSizes() {
  try {
    const allSizes = await db
      .select({
        id: sizes.id,
        name: sizes.name,
        sizeTypeId: sizes.sizeTypeId,
        sizeTypeName: sizeTypes.name,
        sortOrder: sizes.sortOrder,
        createdAt: sizes.createdAt,
        productCount: sql<number>`cast(count(${productSizes.id}) as integer)`,
      })
      .from(sizes)
      .innerJoin(sizeTypes, eq(sizes.sizeTypeId, sizeTypes.id))
      .leftJoin(productSizes, eq(sizes.id, productSizes.sizeId))
      .groupBy(sizes.id, sizeTypes.name, sizeTypes.sortOrder)
      .orderBy(asc(sizeTypes.sortOrder), asc(sizes.sortOrder));

    // Group by type name
    const grouped = allSizes.reduce(
      (acc, size) => {
        const typeName = size.sizeTypeName;
        if (!acc[typeName]) {
          acc[typeName] = [];
        }
        acc[typeName].push(size);
        return acc;
      },
      {} as Record<string, typeof allSizes>,
    );

    return { all: allSizes, grouped };
  } catch (error) {
    console.error("Error fetching sizes:", error);
    throw new Error("Failed to fetch sizes");
  }
}

/**
 * Create a new size in the master table
 */
export async function createSize(data: {
  name: string;
  sizeTypeId: string;
  sortOrder: number;
}) {
  await requireAdmin();
  try {
    // Check sortOrder uniqueness within the same sizeTypeId
    const existingOrder = await db.query.sizes.findFirst({
      where: and(
        eq(sizes.sizeTypeId, data.sizeTypeId),
        eq(sizes.sortOrder, data.sortOrder),
      ),
    });
    if (existingOrder) {
      return {
        success: false,
        error: `Sort order ${data.sortOrder} is already used by "${existingOrder.name}" in this type`,
      };
    }

    const [size] = await db
      .insert(sizes)
      .values({
        name: data.name.toLowerCase(),
        sizeTypeId: data.sizeTypeId,
        sortOrder: data.sortOrder,
      })
      .returning();

    revalidatePath("/admin/products");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/sizes");

    return {
      success: true,
      sizeId: size.id,
    };
  } catch (error) {
    console.error("Error creating size:", error);
    return {
      success: false,
      error: "Failed to create size",
    };
  }
}

/**
 * Update a size in the master table
 */
export async function updateSize(
  id: string,
  data: { name?: string; sizeTypeId?: string; sortOrder?: number },
) {
  await requireAdmin();
  try {
    const existing = await db.query.sizes.findFirst({
      where: eq(sizes.id, id),
    });

    if (!existing) {
      return { success: false, error: "Size not found" };
    }

    // Check sortOrder uniqueness within the same sizeTypeId (excluding self)
    const targetTypeId = data.sizeTypeId ?? existing.sizeTypeId;
    const targetOrder = data.sortOrder ?? existing.sortOrder;

    if (
      targetOrder !== existing.sortOrder ||
      targetTypeId !== existing.sizeTypeId
    ) {
      const duplicateOrder = await db.query.sizes.findFirst({
        where: and(
          eq(sizes.sizeTypeId, targetTypeId),
          eq(sizes.sortOrder, targetOrder),
          ne(sizes.id, id),
        ),
      });
      if (duplicateOrder) {
        return {
          success: false,
          error: `Sort order ${targetOrder} is already used by "${duplicateOrder.name}" in this type`,
        };
      }
    }

    await db
      .update(sizes)
      .set({
        ...(data.name !== undefined && { name: data.name.toLowerCase() }),
        ...(data.sizeTypeId !== undefined && { sizeTypeId: data.sizeTypeId }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      })
      .where(eq(sizes.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/sizes");

    return { success: true };
  } catch (error) {
    console.error("Error updating size:", error);
    return { success: false, error: "Failed to update size" };
  }
}

/**
 * Delete a size (only if not used by any products)
 */
export async function deleteSize(id: string) {
  await requireAdmin();
  try {
    // Check if size is used by any products
    const usageCount = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(productSizes)
      .where(eq(productSizes.sizeId, id));

    const count = usageCount[0]?.count || 0;

    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete size used by ${count} product${count > 1 ? "s" : ""}`,
      };
    }

    await db.delete(sizes).where(eq(sizes.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/sizes");

    return { success: true };
  } catch (error) {
    console.error("Error deleting size:", error);
    return { success: false, error: "Failed to delete size" };
  }
}

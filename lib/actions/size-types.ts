"use server";

import { db } from "@/lib/db";
import { sizeTypes, sizes } from "@/lib/db/schema";
import { eq, sql, asc, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";

/**
 * Get all size types ordered by sortOrder, with size count per type
 */
export async function getSizeTypes() {
  try {
    const allTypes = await db
      .select({
        id: sizeTypes.id,
        name: sizeTypes.name,
        sortOrder: sizeTypes.sortOrder,
        createdAt: sizeTypes.createdAt,
        sizeCount: sql<number>`cast(count(${sizes.id}) as integer)`,
      })
      .from(sizeTypes)
      .leftJoin(sizes, eq(sizeTypes.id, sizes.sizeTypeId))
      .groupBy(sizeTypes.id)
      .orderBy(asc(sizeTypes.sortOrder));

    return allTypes;
  } catch (error) {
    console.error("Error fetching size types:", error);
    throw new Error("Failed to fetch size types");
  }
}

/**
 * Create a new size type
 */
export async function createSizeType(data: {
  name: string;
  sortOrder: number;
}) {
  await requireAdmin();
  try {
    const nameLower = data.name.toLowerCase();

    // Check name uniqueness
    const existingName = await db.query.sizeTypes.findFirst({
      where: eq(sizeTypes.name, nameLower),
    });
    if (existingName) {
      return {
        success: false,
        error: "A size type with this name already exists",
      };
    }

    // Check sortOrder uniqueness
    const existingOrder = await db.query.sizeTypes.findFirst({
      where: eq(sizeTypes.sortOrder, data.sortOrder),
    });
    if (existingOrder) {
      return {
        success: false,
        error: `Sort order ${data.sortOrder} is already used by "${existingOrder.name}"`,
      };
    }

    const [sizeType] = await db
      .insert(sizeTypes)
      .values({
        name: nameLower,
        sortOrder: data.sortOrder,
      })
      .returning();

    revalidatePath("/admin/settings");

    return { success: true, sizeTypeId: sizeType.id };
  } catch (error) {
    console.error("Error creating size type:", error);
    return { success: false, error: "Failed to create size type" };
  }
}

/**
 * Update a size type
 */
export async function updateSizeType(
  id: string,
  data: { name?: string; sortOrder?: number },
) {
  await requireAdmin();
  try {
    const existing = await db.query.sizeTypes.findFirst({
      where: eq(sizeTypes.id, id),
    });
    if (!existing) {
      return { success: false, error: "Size type not found" };
    }

    // Check name uniqueness (excluding self)
    const nameLower =
      data.name !== undefined ? data.name.toLowerCase() : undefined;
    if (nameLower !== undefined && nameLower !== existing.name) {
      const duplicateName = await db.query.sizeTypes.findFirst({
        where: and(eq(sizeTypes.name, nameLower), ne(sizeTypes.id, id)),
      });
      if (duplicateName) {
        return {
          success: false,
          error: "A size type with this name already exists",
        };
      }
    }

    // Check sortOrder uniqueness (excluding self)
    if (data.sortOrder !== undefined && data.sortOrder !== existing.sortOrder) {
      const duplicateOrder = await db.query.sizeTypes.findFirst({
        where: and(
          eq(sizeTypes.sortOrder, data.sortOrder),
          ne(sizeTypes.id, id),
        ),
      });
      if (duplicateOrder) {
        return {
          success: false,
          error: `Sort order ${data.sortOrder} is already used by "${duplicateOrder.name}"`,
        };
      }
    }

    await db
      .update(sizeTypes)
      .set({
        ...(nameLower !== undefined && { name: nameLower }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      })
      .where(eq(sizeTypes.id, id));

    revalidatePath("/admin/settings");
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Error updating size type:", error);
    return { success: false, error: "Failed to update size type" };
  }
}

/**
 * Delete a size type (only if no sizes reference it)
 */
export async function deleteSizeType(id: string) {
  await requireAdmin();
  try {
    const usageCount = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(sizes)
      .where(eq(sizes.sizeTypeId, id));

    const count = usageCount[0]?.count || 0;

    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete size type used by ${count} size${count > 1 ? "s" : ""}`,
      };
    }

    await db.delete(sizeTypes).where(eq(sizeTypes.id, id));

    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Error deleting size type:", error);
    return { success: false, error: "Failed to delete size type" };
  }
}

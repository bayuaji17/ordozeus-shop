"use server";

import { db } from "@/lib/db";
import { couriers } from "@/lib/db/schema";
import { eq, and, ne, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";

/**
 * Get all couriers ordered by name
 */
export async function getCouriers() {
  try {
    const allCouriers = await db
      .select({
        id: couriers.id,
        name: couriers.name,
        code: couriers.code,
        isActive: couriers.isActive,
        createdAt: couriers.createdAt,
        updatedAt: couriers.updatedAt,
      })
      .from(couriers)
      .orderBy(asc(couriers.name));

    return allCouriers;
  } catch (error) {
    console.error("Error fetching couriers:", error);
    throw new Error("Failed to fetch couriers");
  }
}

/**
 * Create a new courier
 */
export async function createCourier(data: {
  name: string;
  code: string;
  isActive: boolean;
}) {
  await requireAdmin();
  try {
    const nameLower = data.name.toLowerCase().trim();
    const codeLower = data.code.toLowerCase().trim();

    // Check name uniqueness
    const existingName = await db.query.couriers.findFirst({
      where: eq(couriers.name, nameLower),
    });
    if (existingName) {
      return {
        success: false,
        error: "A courier with this name already exists",
      };
    }

    // Check code uniqueness
    const existingCode = await db.query.couriers.findFirst({
      where: eq(couriers.code, codeLower),
    });
    if (existingCode) {
      return {
        success: false,
        error: "A courier with this code already exists",
      };
    }

    const [courier] = await db
      .insert(couriers)
      .values({
        name: nameLower,
        code: codeLower,
        isActive: data.isActive,
      })
      .returning();

    revalidatePath("/admin/settings/couriers");

    return {
      success: true,
      courierId: courier.id,
    };
  } catch (error) {
    console.error("Error creating courier:", error);
    return {
      success: false,
      error: "Failed to create courier",
    };
  }
}

/**
 * Update a courier
 */
export async function updateCourier(
  id: string,
  data: { name?: string; code?: string; isActive?: boolean }
) {
  await requireAdmin();
  try {
    const existing = await db.query.couriers.findFirst({
      where: eq(couriers.id, id),
    });

    if (!existing) {
      return { success: false, error: "Courier not found" };
    }

    // Check name uniqueness (excluding self)
    if (data.name !== undefined && data.name.toLowerCase().trim() !== existing.name) {
      const nameLower = data.name.toLowerCase().trim();
      const duplicateName = await db.query.couriers.findFirst({
        where: and(eq(couriers.name, nameLower), ne(couriers.id, id)),
      });
      if (duplicateName) {
        return {
          success: false,
          error: "A courier with this name already exists",
        };
      }
    }

    // Check code uniqueness (excluding self)
    if (data.code !== undefined && data.code.toLowerCase().trim() !== existing.code) {
      const codeLower = data.code.toLowerCase().trim();
      const duplicateCode = await db.query.couriers.findFirst({
        where: and(eq(couriers.code, codeLower), ne(couriers.id, id)),
      });
      if (duplicateCode) {
        return {
          success: false,
          error: "A courier with this code already exists",
        };
      }
    }

    await db
      .update(couriers)
      .set({
        ...(data.name !== undefined && { name: data.name.toLowerCase().trim() }),
        ...(data.code !== undefined && { code: data.code.toLowerCase().trim() }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(couriers.id, id));

    revalidatePath("/admin/settings/couriers");

    return { success: true };
  } catch (error) {
    console.error("Error updating courier:", error);
    return { success: false, error: "Failed to update courier" };
  }
}

/**
 * Delete a courier
 */
export async function deleteCourier(id: string) {
  await requireAdmin();
  try {
    const existing = await db.query.couriers.findFirst({
      where: eq(couriers.id, id),
    });

    if (!existing) {
      return { success: false, error: "Courier not found" };
    }

    await db.delete(couriers).where(eq(couriers.id, id));

    revalidatePath("/admin/settings/couriers");

    return { success: true };
  } catch (error) {
    console.error("Error deleting courier:", error);
    return { success: false, error: "Failed to delete courier" };
  }
}

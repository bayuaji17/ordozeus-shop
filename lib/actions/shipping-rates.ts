"use server";

import { db } from "@/lib/db";
import { shippingRates, couriers } from "@/lib/db/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";

const ITEMS_PER_PAGE = 10;

export interface ShippingRate {
  id: string;
  courierId: string;
  courierName: string | null;
  courierCode: string | null;
  destinationCityId: string;
  destinationProvinceId: string;
  basePrice: number;
  estimatedDays: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingRateInput {
  courierId: string;
  destinationCityId: string;
  destinationProvinceId: string;
  basePrice: number;
  estimatedDays?: string;
  isActive?: boolean;
}

export interface PaginatedRates {
  rates: ShippingRate[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Get paginated shipping rates with optional filters
 */
export async function getShippingRates(
  options: {
    courierId?: string;
    page?: number;
    search?: string;
  } = {}
): Promise<PaginatedRates> {
  const { courierId, page = 1, search } = options;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    // Build where conditions
    const conditions = [];

    if (courierId) {
      conditions.push(eq(shippingRates.courierId, courierId));
    }

    if (search) {
      conditions.push(
        or(
          like(shippingRates.destinationCityId, `%${search}%`),
          like(couriers.name, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(shippingRates)
      .leftJoin(couriers, eq(shippingRates.courierId, couriers.id))
      .where(whereClause || sql`true`);

    const totalCount = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Get rates with courier info
    const ratesData = await db
      .select({
        id: shippingRates.id,
        courierId: shippingRates.courierId,
        courierName: couriers.name,
        courierCode: couriers.code,
        destinationCityId: shippingRates.destinationCityId,
        destinationProvinceId: shippingRates.destinationProvinceId,
        basePrice: shippingRates.basePrice,
        estimatedDays: shippingRates.estimatedDays,
        isActive: shippingRates.isActive,
        createdAt: shippingRates.createdAt,
        updatedAt: shippingRates.updatedAt,
      })
      .from(shippingRates)
      .leftJoin(couriers, eq(shippingRates.courierId, couriers.id))
      .where(whereClause || sql`true`)
      .orderBy(desc(shippingRates.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return {
      rates: ratesData,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    throw new Error("Failed to fetch shipping rates");
  }
}

/**
 * Create a new shipping rate
 */
export async function createShippingRate(data: ShippingRateInput) {
  await requireAdmin();

  try {
    // Check for duplicate rate (same courier + same city)
    const existing = await db.query.shippingRates.findFirst({
      where: and(
        eq(shippingRates.courierId, data.courierId),
        eq(shippingRates.destinationCityId, data.destinationCityId)
      ),
    });

    if (existing) {
      return {
        success: false,
        error: "A shipping rate for this courier and destination already exists",
      };
    }

    const [rate] = await db
      .insert(shippingRates)
      .values({
        courierId: data.courierId,
        destinationCityId: data.destinationCityId,
        destinationProvinceId: data.destinationProvinceId,
        basePrice: data.basePrice,
        estimatedDays: data.estimatedDays || null,
        isActive: data.isActive ?? true,
      })
      .returning();

    revalidatePath("/admin/settings/shipping");

    return { success: true, rateId: rate.id };
  } catch (error) {
    console.error("Error creating shipping rate:", error);
    return { success: false, error: "Failed to create shipping rate" };
  }
}

/**
 * Update an existing shipping rate
 */
export async function updateShippingRate(
  id: string,
  data: Partial<ShippingRateInput>
) {
  await requireAdmin();

  try {
    const existing = await db.query.shippingRates.findFirst({
      where: eq(shippingRates.id, id),
    });

    if (!existing) {
      return { success: false, error: "Shipping rate not found" };
    }

    // Check for duplicate if courier or city is being changed
    if (data.courierId || data.destinationCityId) {
      const newCourierId = data.courierId || existing.courierId;
      const newCityId = data.destinationCityId || existing.destinationCityId;

      const duplicate = await db.query.shippingRates.findFirst({
        where: and(
          eq(shippingRates.courierId, newCourierId),
          eq(shippingRates.destinationCityId, newCityId),
          sql`${shippingRates.id} != ${id}`
        ),
      });

      if (duplicate) {
        return {
          success: false,
          error: "A shipping rate for this courier and destination already exists",
        };
      }
    }

    await db
      .update(shippingRates)
      .set({
        ...(data.courierId !== undefined && { courierId: data.courierId }),
        ...(data.destinationCityId !== undefined && {
          destinationCityId: data.destinationCityId,
        }),
        ...(data.destinationProvinceId !== undefined && {
          destinationProvinceId: data.destinationProvinceId,
        }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.estimatedDays !== undefined && {
          estimatedDays: data.estimatedDays || null,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(shippingRates.id, id));

    revalidatePath("/admin/settings/shipping");

    return { success: true };
  } catch (error) {
    console.error("Error updating shipping rate:", error);
    return { success: false, error: "Failed to update shipping rate" };
  }
}

/**
 * Delete a shipping rate
 */
export async function deleteShippingRate(id: string) {
  await requireAdmin();

  try {
    const existing = await db.query.shippingRates.findFirst({
      where: eq(shippingRates.id, id),
    });

    if (!existing) {
      return { success: false, error: "Shipping rate not found" };
    }

    await db.delete(shippingRates).where(eq(shippingRates.id, id));

    revalidatePath("/admin/settings/shipping");

    return { success: true };
  } catch (error) {
    console.error("Error deleting shipping rate:", error);
    return { success: false, error: "Failed to delete shipping rate" };
  }
}

/**
 * Toggle rate active status
 */
export async function toggleRateActive(id: string, isActive: boolean) {
  await requireAdmin();

  try {
    const existing = await db.query.shippingRates.findFirst({
      where: eq(shippingRates.id, id),
    });

    if (!existing) {
      return { success: false, error: "Shipping rate not found" };
    }

    await db
      .update(shippingRates)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(shippingRates.id, id));

    revalidatePath("/admin/settings/shipping");

    return { success: true };
  } catch (error) {
    console.error("Error toggling rate status:", error);
    return { success: false, error: "Failed to update rate status" };
  }
}

/**
 * Get shipping rate for checkout calculation
 * Priority: City match first, then Province fallback
 */
export async function getShippingRateForCheckout(
  courierId: string,
  destinationCityId: string
): Promise<{ basePrice: number; estimatedDays: string | null } | null> {
  try {
    // Extract province ID from city ID (e.g., "32.73" -> "32")
    const provinceId = destinationCityId.split(".")[0];

    // 1. Try exact city match first
    const cityRate = await db.query.shippingRates.findFirst({
      where: and(
        eq(shippingRates.courierId, courierId),
        eq(shippingRates.destinationCityId, destinationCityId),
        eq(shippingRates.isActive, true)
      ),
    });

    if (cityRate) {
      return {
        basePrice: cityRate.basePrice,
        estimatedDays: cityRate.estimatedDays,
      };
    }

    // 2. Fall back to province rate
    const provinceRate = await db.query.shippingRates.findFirst({
      where: and(
        eq(shippingRates.courierId, courierId),
        eq(shippingRates.destinationProvinceId, provinceId),
        eq(shippingRates.isActive, true)
      ),
    });

    if (provinceRate) {
      return {
        basePrice: provinceRate.basePrice,
        estimatedDays: provinceRate.estimatedDays,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching shipping rate for checkout:", error);
    return null;
  }
}

/**
 * Get the lowest available shipping rate for a city across all active couriers.
 * City match takes priority; falls back to province if no city rate exists.
 * No auth guard — safe for public checkout usage.
 */
export async function getLowestShippingRateForCity(
  cityId: string
): Promise<{ basePrice: number; estimatedDays: string | null } | null> {
  try {
    const provinceId = cityId.split(".")[0];

    // 1. City-level match across all active couriers
    const cityRates = await db
      .select({
        basePrice: shippingRates.basePrice,
        estimatedDays: shippingRates.estimatedDays,
      })
      .from(shippingRates)
      .where(
        and(
          eq(shippingRates.destinationCityId, cityId),
          eq(shippingRates.isActive, true)
        )
      )
      .orderBy(shippingRates.basePrice)
      .limit(1);

    if (cityRates.length > 0) {
      return {
        basePrice: cityRates[0].basePrice,
        estimatedDays: cityRates[0].estimatedDays,
      };
    }

    // 2. Province-level fallback
    const provinceRates = await db
      .select({
        basePrice: shippingRates.basePrice,
        estimatedDays: shippingRates.estimatedDays,
      })
      .from(shippingRates)
      .where(
        and(
          eq(shippingRates.destinationProvinceId, provinceId),
          eq(shippingRates.isActive, true)
        )
      )
      .orderBy(shippingRates.basePrice)
      .limit(1);

    if (provinceRates.length > 0) {
      return {
        basePrice: provinceRates[0].basePrice,
        estimatedDays: provinceRates[0].estimatedDays,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching lowest shipping rate:", error);
    return null;
  }
}

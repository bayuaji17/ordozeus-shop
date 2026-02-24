"use server";

import { db } from "@/lib/db";
import { shopSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";

export interface ShopLocationData {
  provinceId?: string;
  provinceName?: string;
  cityId?: string;
  cityName?: string;
  districtId?: string;
  districtName?: string;
  postalCode?: string;
  fullAddress?: string;
}

export async function getShopLocation() {
  try {
    const settings = await db.query.shopSettings.findFirst();
    return settings || null;
  } catch (error) {
    console.error("Error fetching shop location:", error);
    return null;
  }
}

export async function saveShopLocation(data: ShopLocationData) {
  await requireAdmin();
  try {
    const existing = await db.query.shopSettings.findFirst();

    if (existing) {
      await db
        .update(shopSettings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(shopSettings.id, existing.id));
    } else {
      await db.insert(shopSettings).values({
        ...data,
      });
    }

    revalidatePath("/admin/settings/location");

    return { success: true };
  } catch (error) {
    console.error("Error saving shop location:", error);
    return { success: false, error: "Failed to save location" };
  }
}

"use server";

import { db } from "@/lib/db";
import {
  products,
  productSizes,
  sizes,
  sizeTypes,
  inventoryMovements,
} from "@/lib/db/schema";
import { sql, eq, desc, and, or, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  stockAdjustmentSchema,
  bulkStockAdjustmentSchema,
  type StockAdjustmentFormData,
  type BulkStockAdjustmentFormData,
} from "@/lib/validations/inventory";
import { requireAdmin } from "@/lib/auth/server";

/**
 * Get inventory overview with stock levels
 */
export async function getInventoryOverview(filters?: {
  search?: string;
  stockLevel?: "all" | "in-stock" | "low-stock" | "out-of-stock";
  page?: number;
  limit?: number;
}) {
  try {
    const {
      search = "",
      stockLevel = "all",
      page = 1,
      limit = 20,
    } = filters || {};

    const offset = (page - 1) * limit;

    // Single query: each row = product + size combination
    let query = db
      .select({
        id: productSizes.id,
        productId: products.id,
        productSizeId: productSizes.id,
        name: sql<string>`${products.name} || ' - ' || ${sizes.name}`,
        sku: productSizes.sku,
        stock: productSizes.stock,
        status: products.status,
        sizeInfo: sizes.name,
        sizeType: sizeTypes.name,
      })
      .from(productSizes)
      .innerJoin(products, eq(productSizes.productId, products.id))
      .innerJoin(sizes, eq(productSizes.sizeId, sizes.id))
      .innerJoin(sizeTypes, eq(sizes.sizeTypeId, sizeTypes.id))
      .$dynamic();

    if (search) {
      query = query.where(
        or(
          like(products.name, `%${search}%`),
          like(productSizes.sku, `%${search}%`),
          like(sizes.name, `%${search}%`),
        ),
      );
    }

    const allResults = await query.orderBy(products.name, sizes.sortOrder);

    // Apply stock level filter in memory
    let filteredResults = allResults;
    if (stockLevel !== "all") {
      filteredResults = allResults.filter((item) => {
        const stock = item.stock;
        if (stockLevel === "out-of-stock") return stock === 0;
        if (stockLevel === "low-stock") return stock > 0 && stock <= 10;
        if (stockLevel === "in-stock") return stock > 10;
        return true;
      });
    }

    // Apply pagination
    const paginatedResults = filteredResults.slice(offset, offset + limit);
    const total = filteredResults.length;

    return {
      items: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching inventory overview:", error);
    throw new Error("Failed to fetch inventory overview");
  }
}

/**
 * Adjust stock for a product size
 */
export async function adjustStock(data: StockAdjustmentFormData) {
  await requireAdmin();
  try {
    const validatedData = stockAdjustmentSchema.parse(data);

    await db.transaction(async (tx) => {
      // Get current stock from productSizes
      const productSize = await tx.query.productSizes.findFirst({
        where: eq(productSizes.id, validatedData.productSizeId),
      });

      if (!productSize) {
        throw new Error("Product size not found");
      }

      const currentStock = productSize.stock;
      let newStock: number;

      if (validatedData.type === "in") {
        newStock = currentStock + validatedData.quantity;
      } else if (validatedData.type === "out") {
        newStock = Math.max(0, currentStock - Math.abs(validatedData.quantity));
      } else {
        // adjust
        newStock = validatedData.quantity;
      }

      // Update product size stock
      await tx
        .update(productSizes)
        .set({ stock: newStock })
        .where(eq(productSizes.id, validatedData.productSizeId));

      // Record inventory movement
      await tx.insert(inventoryMovements).values({
        productId: validatedData.productId,
        productSizeId: validatedData.productSizeId,
        type: validatedData.type,
        quantity: validatedData.quantity,
        reason: validatedData.reason,
      });
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error adjusting stock:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to adjust stock",
    };
  }
}

/**
 * Bulk adjust stock for multiple product sizes
 */
export async function bulkAdjustStock(data: BulkStockAdjustmentFormData) {
  await requireAdmin();
  try {
    const validatedData = bulkStockAdjustmentSchema.parse(data);

    const results = [];

    for (const adjustment of validatedData.adjustments) {
      const result = await adjustStock(adjustment);
      results.push({
        ...adjustment,
        success: result.success,
        error: "error" in result ? result.error : undefined,
      });
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      results,
    };
  } catch (error) {
    console.error("Error bulk adjusting stock:", error);

    if (error instanceof Error) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        results: [],
        error: error.message,
      };
    }

    return {
      success: false,
      successCount: 0,
      failureCount: 0,
      results: [],
      error: "Failed to bulk adjust stock",
    };
  }
}

/**
 * Get inventory movement history
 */
export async function getInventoryHistory(
  productId?: string,
  productSizeId?: string,
  limit = 50,
) {
  try {
    let query = db
      .select({
        id: inventoryMovements.id,
        productId: inventoryMovements.productId,
        productSizeId: inventoryMovements.productSizeId,
        type: inventoryMovements.type,
        quantity: inventoryMovements.quantity,
        reason: inventoryMovements.reason,
        createdAt: inventoryMovements.createdAt,
        productName: products.name,
        sizeName: sizes.name,
        sku: productSizes.sku,
      })
      .from(inventoryMovements)
      .leftJoin(products, eq(inventoryMovements.productId, products.id))
      .leftJoin(
        productSizes,
        eq(inventoryMovements.productSizeId, productSizes.id),
      )
      .leftJoin(sizes, eq(productSizes.sizeId, sizes.id))
      .$dynamic();

    const conditions = [];

    if (productId) {
      conditions.push(eq(inventoryMovements.productId, productId));
    }

    if (productSizeId) {
      conditions.push(eq(inventoryMovements.productSizeId, productSizeId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const movements = await query
      .orderBy(desc(inventoryMovements.createdAt))
      .limit(limit);

    return movements;
  } catch (error) {
    console.error("Error fetching inventory history:", error);
    throw new Error("Failed to fetch inventory history");
  }
}

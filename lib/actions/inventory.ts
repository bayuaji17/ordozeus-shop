"use server";

import { db } from "@/lib/db";
import { products, productVariants, inventoryMovements } from "@/lib/db/schema";
import { sql, eq, desc, and, or, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  stockAdjustmentSchema,
  bulkStockAdjustmentSchema,
  type StockAdjustmentFormData,
  type BulkStockAdjustmentFormData,
} from "@/lib/validations/inventory";

/**
 * Get inventory overview with stock levels
 */
export async function getInventoryOverview(filters?: {
  search?: string;
  stockLevel?: "all" | "in-stock" | "low-stock" | "out-of-stock";
  productType?: "all" | "simple" | "variant";
  page?: number;
  limit?: number;
}) {
  try {
    const {
      search = "",
      stockLevel = "all",
      productType = "all",
      page = 1,
      limit = 20,
    } = filters || {};

    const offset = (page - 1) * limit;

    // Build base query for simple products
    const simpleProductsQuery = db
      .select({
        id: products.id,
        productId: products.id,
        variantId: sql<string | null>`NULL`,
        name: products.name,
        sku: sql<string>`'N/A'`,
        stock: products.stock,
        hasVariant: products.hasVariant,
        isActive: sql<boolean>`true`,
        type: sql<string>`'simple'`,
      })
      .from(products)
      .where(
        and(
          eq(products.hasVariant, false),
          search
            ? or(
                like(products.name, `%${search}%`),
                like(products.slug, `%${search}%`),
              )
            : undefined,
        ),
      )
      .$dynamic();

    // Build base query for variant products
    const variantProductsQuery = db
      .select({
        id: productVariants.id,
        productId: products.id,
        variantId: productVariants.id,
        name: sql<string>`${products.name} || ' - ' || ${productVariants.sku}`,
        sku: productVariants.sku,
        stock: productVariants.stock,
        hasVariant: products.hasVariant,
        isActive: productVariants.isActive,
        type: sql<string>`'variant'`,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(
        search
          ? or(
              like(products.name, `%${search}%`),
              like(productVariants.sku, `%${search}%`),
            )
          : undefined,
      )
      .$dynamic();

    // Combine queries based on product type filter
    let combinedQuery;
    if (productType === "simple") {
      combinedQuery = simpleProductsQuery;
    } else if (productType === "variant") {
      combinedQuery = variantProductsQuery;
    } else {
      // Union both queries
      combinedQuery = db
        .select({
          id: sql<string>`id`,
          productId: sql<string>`product_id`,
          variantId: sql<string | null>`variant_id`,
          name: sql<string>`name`,
          sku: sql<string>`sku`,
          stock: sql<number | null>`stock`,
          hasVariant: sql<boolean>`has_variant`,
          isActive: sql<boolean>`is_active`,
          type: sql<string>`type`,
        })
        .from(
          sql`(
            SELECT
              ${products.id} as id,
              ${products.id} as product_id,
              NULL as variant_id,
              ${products.name} as name,
              'N/A' as sku,
              ${products.stock} as stock,
              ${products.hasVariant} as has_variant,
              true as is_active,
              'simple' as type
            FROM ${products}
            WHERE ${products.hasVariant} = false
            ${search ? sql`AND (${products.name} ILIKE ${"%" + search + "%"} OR ${products.slug} ILIKE ${"%" + search + "%"})` : sql``}

            UNION ALL

            SELECT
              ${productVariants.id} as id,
              ${products.id} as product_id,
              ${productVariants.id} as variant_id,
              ${products.name} || ' - ' || ${productVariants.sku} as name,
              ${productVariants.sku} as sku,
              ${productVariants.stock} as stock,
              ${products.hasVariant} as has_variant,
              ${productVariants.isActive} as is_active,
              'variant' as type
            FROM ${productVariants}
            INNER JOIN ${products} ON ${productVariants.productId} = ${products.id}
            ${search ? sql`WHERE ${products.name} ILIKE ${"%" + search + "%"} OR ${productVariants.sku} ILIKE ${"%" + search + "%"}` : sql``}
          ) as inventory`,
        );
    }

    // Execute query
    const allResults = await combinedQuery;

    // Apply stock level filter in memory
    let filteredResults = allResults;
    if (stockLevel !== "all") {
      filteredResults = allResults.filter((item) => {
        const stock = item.stock || 0;
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
 * Adjust stock for a product or variant
 */
export async function adjustStock(data: StockAdjustmentFormData) {
  try {
    // Validate input
    const validatedData = stockAdjustmentSchema.parse(data);

    await db.transaction(async (tx) => {
      // Determine the new stock value
      let currentStock = 0;
      let newStock = 0;

      if (validatedData.variantId) {
        // Variant product
        const variant = await tx.query.productVariants.findFirst({
          where: eq(productVariants.id, validatedData.variantId),
        });

        if (!variant) {
          throw new Error("Variant not found");
        }

        currentStock = variant.stock;

        if (validatedData.type === "in") {
          newStock = currentStock + validatedData.quantity;
        } else if (validatedData.type === "out") {
          newStock = Math.max(
            0,
            currentStock - Math.abs(validatedData.quantity),
          );
        } else if (validatedData.type === "adjust") {
          newStock = validatedData.quantity;
        }

        // Update variant stock
        await tx
          .update(productVariants)
          .set({ stock: newStock })
          .where(eq(productVariants.id, validatedData.variantId));
      } else {
        // Simple product
        const product = await tx.query.products.findFirst({
          where: eq(products.id, validatedData.productId),
        });

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.hasVariant) {
          throw new Error("Cannot adjust stock on variant product directly");
        }

        currentStock = product.stock || 0;

        if (validatedData.type === "in") {
          newStock = currentStock + validatedData.quantity;
        } else if (validatedData.type === "out") {
          newStock = Math.max(
            0,
            currentStock - Math.abs(validatedData.quantity),
          );
        } else if (validatedData.type === "adjust") {
          newStock = validatedData.quantity;
        }

        // Update product stock
        await tx
          .update(products)
          .set({ stock: newStock })
          .where(eq(products.id, validatedData.productId));
      }

      // Record inventory movement
      await tx.insert(inventoryMovements).values({
        productId: validatedData.productId,
        variantId: validatedData.variantId || null,
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
 * Bulk adjust stock for multiple products/variants
 */
export async function bulkAdjustStock(data: BulkStockAdjustmentFormData) {
  try {
    // Validate input
    const validatedData = bulkStockAdjustmentSchema.parse(data);

    const results = [];

    for (const adjustment of validatedData.adjustments) {
      const result = await adjustStock(adjustment);
      results.push({
        ...adjustment,
        success: result.success,
        error: result.error,
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
  variantId?: string,
  limit = 50,
) {
  try {
    let query = db
      .select({
        id: inventoryMovements.id,
        productId: inventoryMovements.productId,
        variantId: inventoryMovements.variantId,
        type: inventoryMovements.type,
        quantity: inventoryMovements.quantity,
        reason: inventoryMovements.reason,
        createdAt: inventoryMovements.createdAt,
        productName: products.name,
        variantSku: productVariants.sku,
      })
      .from(inventoryMovements)
      .leftJoin(products, eq(inventoryMovements.productId, products.id))
      .leftJoin(
        productVariants,
        eq(inventoryMovements.variantId, productVariants.id),
      )
      .$dynamic();

    const conditions = [];

    if (productId) {
      conditions.push(eq(inventoryMovements.productId, productId));
    }

    if (variantId) {
      conditions.push(eq(inventoryMovements.variantId, variantId));
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

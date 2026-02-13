"use server";

import { db } from "@/lib/db";
import { products, productSizes, sizes, categories } from "@/lib/db/schema";
import { sql, eq, lt } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    // Get total products count by status
    const productStats = await db
      .select({
        status: products.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(products)
      .groupBy(products.status);

    // Get total categories count by level
    const categoryStats = await db
      .select({
        level: categories.level,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(categories)
      .groupBy(categories.level);

    // Get total product sizes count
    const sizesCount = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(productSizes);

    // Get low stock product sizes (stock < 10)
    const lowStockItems = await db
      .select({
        id: productSizes.id,
        name: sql<string>`${products.name} || ' - ' || ${sizes.name}`,
        stock: productSizes.stock,
        sku: productSizes.sku,
      })
      .from(productSizes)
      .innerJoin(products, eq(productSizes.productId, products.id))
      .innerJoin(sizes, eq(productSizes.sizeId, sizes.id))
      .where(lt(productSizes.stock, 10))
      .orderBy(productSizes.stock);

    // Calculate totals
    const totalProducts = productStats.reduce(
      (acc, stat) => acc + stat.count,
      0,
    );
    const activeProducts =
      productStats.find((s) => s.status === "active")?.count || 0;
    const draftProducts =
      productStats.find((s) => s.status === "draft")?.count || 0;
    const archivedProducts =
      productStats.find((s) => s.status === "archived")?.count || 0;

    const totalCategories = categoryStats.reduce(
      (acc, stat) => acc + stat.count,
      0,
    );
    const totalSizes = sizesCount[0]?.count || 0;

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        draft: draftProducts,
        archived: archivedProducts,
      },
      categories: {
        total: totalCategories,
        byLevel: categoryStats,
      },
      sizes: {
        total: totalSizes,
      },
      lowStock: {
        count: lowStockItems.length,
        items: lowStockItems.slice(0, 5),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}

export async function getProductStatusDistribution() {
  try {
    const distribution = await db
      .select({
        status: products.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(products)
      .groupBy(products.status);

    return distribution;
  } catch (error) {
    console.error("Error fetching product status distribution:", error);
    throw new Error("Failed to fetch product status distribution");
  }
}

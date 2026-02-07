"use server";

import { db } from "@/lib/db";
import { products, productVariants, categories } from "@/lib/db/schema";
import { sql, eq, and, lt } from "drizzle-orm";

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

    // Get total categories count by gender
    const categoryStats = await db
      .select({
        type: categories.type,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(categories)
      .groupBy(categories.type);

    // Get total variants count
    const variantsCount = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(productVariants);

    // Get low stock items (products with stock < 10, variants with stock < 5)
    const lowStockProducts = await db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
        type: sql<string>`'product'`,
      })
      .from(products)
      .where(
        and(
          eq(products.hasVariant, false),
          lt(products.stock, 10)
        )
      );

    const lowStockVariants = await db
      .select({
        id: productVariants.id,
        name: sql<string>`${products.name} || ' - ' || ${productVariants.sku}`,
        stock: productVariants.stock,
        type: sql<string>`'variant'`,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(lt(productVariants.stock, 5));

    const lowStockItems = [...lowStockProducts, ...lowStockVariants];

    // Calculate totals
    const totalProducts = productStats.reduce((acc, stat) => acc + stat.count, 0);
    const activeProducts = productStats.find(s => s.status === 'active')?.count || 0;
    const draftProducts = productStats.find(s => s.status === 'draft')?.count || 0;
    const archivedProducts = productStats.find(s => s.status === 'archived')?.count || 0;

    const totalCategories = categoryStats.reduce((acc, stat) => acc + stat.count, 0);
    const totalVariants = variantsCount[0]?.count || 0;

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        draft: draftProducts,
        archived: archivedProducts,
      },
      categories: {
        total: totalCategories,
        byGender: categoryStats,
      },
      variants: {
        total: totalVariants,
      },
      lowStock: {
        count: lowStockItems.length,
        items: lowStockItems.slice(0, 5), // Top 5 low stock items
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

"use server";

import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productCategories,
  categories,
} from "@/lib/db/schema";
import { sql, eq, like, or, and, desc, asc } from "drizzle-orm";

export type ProductStatus = "draft" | "active" | "archived";
export type StockLevel = "all" | "in_stock" | "low_stock" | "out_of_stock";

export interface ProductFilters {
  search?: string;
  status?: ProductStatus | "all";
  stockLevel?: StockLevel;
  categoryId?: string;
  sortBy?: "name" | "price" | "stock" | "created";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  try {
    const {
      search = "",
      status = "all",
      stockLevel = "all",
      sortBy = "created",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    const offset = (page - 1) * limit;

    // Build the base query
    let query = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        basePrice: products.basePrice,
        stock: products.stock,
        hasVariant: products.hasVariant,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        variantCount: sql<number>`cast(count(distinct ${productVariants.id}) as integer)`,
        categoryCount: sql<number>`cast(count(distinct ${productCategories.categoryId}) as integer)`,
        totalStock: sql<number>`
          cast(
            case
              when ${products.hasVariant} then coalesce(sum(${productVariants.stock}), 0)
              else coalesce(${products.stock}, 0)
            end
          as integer)
        `,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .leftJoin(productCategories, eq(products.id, productCategories.productId))
      .$dynamic();

    // Apply filters
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.slug, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }

    // Status filter
    if (status !== "all") {
      conditions.push(eq(products.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Group by and order
    query = query.groupBy(products.id);

    // Sorting
    if (sortBy === "name") {
      query = query.orderBy(
        sortOrder === "asc" ? asc(products.name) : desc(products.name)
      );
    } else if (sortBy === "price") {
      query = query.orderBy(
        sortOrder === "asc" ? asc(products.basePrice) : desc(products.basePrice)
      );
    } else {
      query = query.orderBy(
        sortOrder === "asc" ? asc(products.createdAt) : desc(products.createdAt)
      );
    }

    // Execute query with pagination
    const result = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    // Apply stock level filter in memory (since it depends on aggregated totalStock)
    let filteredResult = result;
    if (stockLevel !== "all") {
      filteredResult = result.filter((product) => {
        const stock = product.totalStock;
        if (stockLevel === "out_of_stock") return stock === 0;
        if (stockLevel === "low_stock") return stock > 0 && stock <= 10;
        if (stockLevel === "in_stock") return stock > 10;
        return true;
      });
    }

    return {
      products: filteredResult,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function getProductById(id: string) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        productCategories: {
          with: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Get product options and their values
    const productOptions = await db.query.productOptions.findMany({
      where: eq(products.id, id),
      with: {
        values: true,
      },
    });

    // Get product variants with their option values
    const variants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, id),
      with: {
        variantValues: {
          with: {
            optionValue: {
              with: {
                option: true,
              },
            },
          },
        },
      },
    });

    return {
      ...product,
      options: productOptions,
      variants,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

export async function getAllCategories() {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        type: categories.type,
        isActive: categories.isActive,
        productCount: sql<number>`cast(count(${productCategories.productId}) as integer)`,
      })
      .from(categories)
      .leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));

    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

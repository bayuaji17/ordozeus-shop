"use server";

import { db } from "@/lib/db";
import {
  products,
  productSizes,
  productCategories,
  categories,
  productImages,
  inventoryMovements,
} from "@/lib/db/schema";
import { sql, eq, like, or, and, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/auth/server";

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

    let query = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        basePrice: products.basePrice,
        isFeatured: products.isFeatured,
        displayOrder: products.displayOrder,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        sizeCount: sql<number>`cast(count(distinct ${productSizes.id}) as integer)`,
        categoryCount: sql<number>`cast(count(distinct ${productCategories.categoryId}) as integer)`,
        totalStock: sql<number>`cast(coalesce(sum(${productSizes.stock}), 0) as integer)`,
      })
      .from(products)
      .leftJoin(productSizes, eq(products.id, productSizes.productId))
      .leftJoin(productCategories, eq(products.id, productCategories.productId))
      .$dynamic();

    // Apply filters
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.slug, `%${search}%`),
          like(products.description, `%${search}%`),
        ),
      );
    }

    if (status !== "all") {
      conditions.push(eq(products.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.groupBy(products.id);

    // Sorting
    if (sortBy === "name") {
      query = query.orderBy(
        sortOrder === "asc" ? asc(products.name) : desc(products.name),
      );
    } else if (sortBy === "price") {
      query = query.orderBy(
        sortOrder === "asc"
          ? asc(products.basePrice)
          : desc(products.basePrice),
      );
    } else {
      query = query.orderBy(
        sortOrder === "asc"
          ? asc(products.createdAt)
          : desc(products.createdAt),
      );
    }

    const result = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    // Apply stock level filter in memory (depends on aggregated totalStock)
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
        productImages: {
          orderBy: (images, { asc, desc }) => [
            asc(images.displayOrder),
            desc(images.createdAt),
          ],
        },
        sizes: {
          with: {
            size: {
              with: {
                sizeType: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return {
      ...product,
      images: product.productImages,
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
        parentId: categories.parentId,
        level: categories.level,
        isActive: categories.isActive,
        productCount: sql<number>`cast(count(${productCategories.productId}) as integer)`,
      })
      .from(categories)
      .leftJoin(
        productCategories,
        eq(categories.id, productCategories.categoryId),
      )
      .groupBy(categories.id)
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================

/**
 * Helper function to generate SKU for a product size
 */
function generateSizeSKU(
  productSlug: string,
  sizeName: string,
  index: number,
): string {
  const sizeInitials = sizeName.substring(0, 3).toUpperCase();
  const paddedIndex = String(index + 1).padStart(3, "0");
  return `${productSlug}-${sizeInitials}-${paddedIndex}`;
}

/**
 * Create a new product with sizes
 */
export async function createProduct(data: ProductFormData) {
  await requireAdmin();
  try {
    const validatedData = productSchema.parse(data);

    // Check if slug already exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.slug, validatedData.slug),
    });

    if (existingProduct) {
      return {
        success: false,
        error: "A product with this slug already exists",
      };
    }

    const result = await db.transaction(async (tx) => {
      // Insert product
      const [product] = await tx
        .insert(products)
        .values({
          name: validatedData.name,
          slug: validatedData.slug,
          description: validatedData.description,
          basePrice: validatedData.basePrice,
          status: validatedData.status,
          isFeatured: validatedData.isFeatured,
          displayOrder: validatedData.displayOrder,
        })
        .returning();

      // Insert category associations
      if (validatedData.categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          validatedData.categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          })),
        );
      }

      // Insert product sizes
      if (validatedData.sizes.length > 0) {
        // Look up size names for SKU generation
        const sizeIds = validatedData.sizes.map((s) => s.sizeId);
        const sizeRecords = await tx.query.sizes.findMany({
          where: (s, { inArray }) => inArray(s.id, sizeIds),
        });
        const sizeNameMap = new Map(sizeRecords.map((s) => [s.id, s.name]));

        await tx.insert(productSizes).values(
          validatedData.sizes.map((size, index) => ({
            productId: product.id,
            sizeId: size.sizeId,
            sku:
              size.sku ||
              generateSizeSKU(
                product.slug,
                sizeNameMap.get(size.sizeId) || "UNK",
                index,
              ),
            stock: size.stock,
          })),
        );
      }

      return product;
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      productId: result.id,
    };
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create product",
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, data: ProductFormData) {
  await requireAdmin();
  try {
    const validatedData = productSchema.parse(data);

    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Check slug conflict
    if (validatedData.slug !== existingProduct.slug) {
      const slugConflict = await db.query.products.findFirst({
        where: eq(products.slug, validatedData.slug),
      });

      if (slugConflict && slugConflict.id !== id) {
        return {
          success: false,
          error: "A product with this slug already exists",
        };
      }
    }

    await db.transaction(async (tx) => {
      // Update product base fields
      await tx
        .update(products)
        .set({
          name: validatedData.name,
          slug: validatedData.slug,
          description: validatedData.description,
          basePrice: validatedData.basePrice,
          status: validatedData.status,
          isFeatured: validatedData.isFeatured,
          displayOrder: validatedData.displayOrder,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));

      // Update category associations
      await tx
        .delete(productCategories)
        .where(eq(productCategories.productId, id));

      if (validatedData.categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          validatedData.categoryIds.map((categoryId) => ({
            productId: id,
            categoryId,
          })),
        );
      }

      // Sync product sizes: delete old, insert new
      await tx.delete(productSizes).where(eq(productSizes.productId, id));

      if (validatedData.sizes.length > 0) {
        const sizeIds = validatedData.sizes.map((s) => s.sizeId);
        const sizeRecords = await tx.query.sizes.findMany({
          where: (s, { inArray }) => inArray(s.id, sizeIds),
        });
        const sizeNameMap = new Map(sizeRecords.map((s) => [s.id, s.name]));

        await tx.insert(productSizes).values(
          validatedData.sizes.map((size, index) => ({
            productId: id,
            sizeId: size.sizeId,
            sku:
              size.sku ||
              generateSizeSKU(
                validatedData.slug,
                sizeNameMap.get(size.sizeId) || "UNK",
                index,
              ),
            stock: size.stock,
          })),
        );
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return {
      success: true,
      productId: id,
    };
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update product",
    };
  }
}

/**
 * Delete a product permanently (hard delete)
 */
export async function deleteProduct(id: string) {
  await requireAdmin();
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Collect image keys for R2 cleanup
    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, id),
      columns: {
        key: true,
      },
    });
    const imageKeys = images.map((image) => image.key);

    await db.transaction(async (tx) => {
      // Remove inventory records
      await tx
        .delete(inventoryMovements)
        .where(eq(inventoryMovements.productId, id));

      // Remove product-category links
      await tx
        .delete(productCategories)
        .where(eq(productCategories.productId, id));

      // Remove product sizes (cascades from product delete too, but explicit is clearer)
      await tx.delete(productSizes).where(eq(productSizes.productId, id));

      // Delete the product (productImages cascade-delete)
      await tx.delete(products).where(eq(products.id, id));
    });

    // Delete images from R2 storage
    if (imageKeys.length > 0) {
      try {
        const { deleteManyFromR2 } = await import("@/lib/r2");
        await deleteManyFromR2(imageKeys);
      } catch (r2Error) {
        console.error(
          "Error deleting product images from R2 (continuing):",
          r2Error,
        );
      }
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting product:", error);

    return {
      success: false,
      error: "Failed to delete product",
    };
  }
}

/**
 * Toggle product status between draft/active/archived
 */
export async function toggleProductStatus(
  id: string,
  status: "draft" | "active" | "archived",
) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    await db
      .update(products)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error toggling product status:", error);

    return {
      success: false,
      error: "Failed to update product status",
    };
  }
}

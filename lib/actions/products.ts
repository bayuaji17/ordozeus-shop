"use server";

import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productCategories,
  categories,
  productOptions,
  productOptionValues,
  productVariantValues,
  productImages,
  inventoryMovements,
} from "@/lib/db/schema";
import { sql, eq, like, or, and, desc, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  productSchema,
  type ProductFormData,
  type VariantProductFormData,
} from "@/lib/validations/product";

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
          like(products.description, `%${search}%`),
        ),
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
        productImages: {
          orderBy: (images, { asc, desc }) => [
            asc(images.displayOrder),
            desc(images.createdAt),
          ],
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
        type: categories.type,
        isActive: categories.isActive,
        productCount: sql<number>`cast(count(${productCategories.productId}) as integer)`,
      })
      .from(categories)
      .leftJoin(
        productCategories,
        eq(categories.id, productCategories.categoryId),
      )
      .groupBy(categories.id)
      .orderBy(asc(categories.name));

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
 * Helper function to generate SKU for a variant
 */
function generateVariantSKU(
  productSlug: string,
  optionValues: string[],
  index: number,
): string {
  const initials = optionValues
    .map((val) => val.substring(0, 2).toUpperCase())
    .join("");
  const paddedIndex = String(index + 1).padStart(3, "0");
  return `${productSlug}-${initials}-${paddedIndex}`;
}

/**
 * Helper function to generate cartesian product of option values
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map((item) => [item]);

  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);

  return first.flatMap((item) => restProduct.map((prod) => [item, ...prod]));
}

/**
 * Create a new product (simple or with variants)
 */
export async function createProduct(data: ProductFormData) {
  try {
    // Validate input
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

    // Use transaction for complex operations
    const result = await db.transaction(async (tx) => {
      // Insert product
      const [product] = await tx
        .insert(products)
        .values({
          name: validatedData.name,
          slug: validatedData.slug,
          description: validatedData.description,
          basePrice: validatedData.basePrice,
          hasVariant: validatedData.hasVariant,
          status: validatedData.status,
          stock: validatedData.hasVariant ? null : validatedData.stock,
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

      // Handle variant products
      if (validatedData.hasVariant) {
        const variantData = validatedData as VariantProductFormData;

        // Insert options and their values
        for (const option of variantData.options) {
          const [insertedOption] = await tx
            .insert(productOptions)
            .values({
              productId: product.id,
              name: option.name,
            })
            .returning();

          // Insert option values
          for (const value of option.values) {
            await tx.insert(productOptionValues).values({
              optionId: insertedOption.id,
              value: value.value,
            });
          }
        }

        // Get all option values for variant generation
        const allOptions = await tx.query.productOptions.findMany({
          where: eq(productOptions.productId, product.id),
          with: {
            values: true,
          },
        });

        // Generate variants using cartesian product
        const optionValueArrays = allOptions.map((opt) => opt.values);
        const combinations = cartesianProduct(optionValueArrays);

        // Create a map of option value combinations to form variant data
        // This allows us to match generated combinations with user-entered stock/price
        const formVariantsMap = new Map<string, { price: number; stock: number; isActive?: boolean }>();
        for (const formVariant of variantData.variants) {
          // Use SKU as key since it's unique per combination
          formVariantsMap.set(formVariant.sku, {
            price: formVariant.price,
            stock: formVariant.stock,
            isActive: formVariant.isActive,
          });
        }

        // Insert variants
        for (let i = 0; i < combinations.length; i++) {
          const combination = combinations[i];
          const sku = generateVariantSKU(
            product.slug,
            combination.map((v) => v.value),
            i,
          );

          // Get user-entered values or use defaults
          const formVariant = formVariantsMap.get(sku);
          const variantPrice = formVariant?.price ?? product.basePrice;
          const variantStock = formVariant?.stock ?? 0;
          const variantIsActive = formVariant?.isActive ?? true;

          const [variant] = await tx
            .insert(productVariants)
            .values({
              productId: product.id,
              sku,
              price: variantPrice,
              stock: variantStock,
              isActive: variantIsActive,
            })
            .returning();

          // Link variant to option values
          for (const optionValue of combination) {
            await tx.insert(productVariantValues).values({
              variantId: variant.id,
              optionValueId: optionValue.id,
            });
          }
        }
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
  try {
    // Validate input
    const validatedData = productSchema.parse(data);

    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Check if slug is being changed and if it conflicts
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

    // Use transaction for complex operations
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
          stock: validatedData.hasVariant ? null : validatedData.stock,
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

      // For variant products, this is complex - for now, simple update
      // Full variant sync would require comparing existing vs new options/values
      // and adding/removing variants accordingly
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

    // Collect image keys for R2 cleanup after DB deletion
    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, id),
      columns: {
        key: true,
      },
    });
    const imageKeys = images.map((image) => image.key);

    await db.transaction(async (tx) => {
      // Remove inventory records first (references product and variants)
      await tx
        .delete(inventoryMovements)
        .where(eq(inventoryMovements.productId, id));

      // Remove product-category links
      await tx
        .delete(productCategories)
        .where(eq(productCategories.productId, id));

      // Remove variant values and variants for this product
      const variants = await tx.query.productVariants.findMany({
        where: eq(productVariants.productId, id),
        columns: {
          id: true,
        },
      });
      const variantIds = variants.map((variant) => variant.id);

      if (variantIds.length > 0) {
        await tx
          .delete(productVariantValues)
          .where(inArray(productVariantValues.variantId, variantIds));
      }

      await tx.delete(productVariants).where(eq(productVariants.productId, id));

      // Remove option values and options for this product
      const options = await tx.query.productOptions.findMany({
        where: eq(productOptions.productId, id),
        columns: {
          id: true,
        },
      });
      const optionIds = options.map((option) => option.id);

      if (optionIds.length > 0) {
        await tx
          .delete(productOptionValues)
          .where(inArray(productOptionValues.optionId, optionIds));
      }

      await tx.delete(productOptions).where(eq(productOptions.productId, id));

      // Finally delete the product (product_images rows cascade-delete)
      await tx.delete(products).where(eq(products.id, id));
    });

    // Delete images from R2 storage after successful DB delete
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

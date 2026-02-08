"use server";

import { db } from "@/lib/db";
import { categories, productCategories } from "@/lib/db/schema";
import { eq, sql, asc, desc, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/category";

/**
 * Get all categories with product counts
 */
export async function getCategories(filters?: {
  search?: string;
  type?: "man" | "woman" | "unisex" | "all";
  isActive?: boolean | "all";
}) {
  try {
    const { search = "", type = "all", isActive = "all" } = filters || {};

    let query = db
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
      .$dynamic();

    // Apply filters
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(categories.name, `%${search}%`),
          like(categories.slug, `%${search}%`)
        )
      );
    }

    if (type !== "all") {
      conditions.push(eq(categories.type, type));
    }

    if (isActive !== "all") {
      conditions.push(eq(categories.isActive, isActive));
    }

    if (conditions.length > 0) {
      query = query.where(sql`${sql.join(conditions, sql` AND `)}`);
    }

    const result = await query.groupBy(categories.id).orderBy(asc(categories.name));

    return result;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) {
      return null;
    }

    // Get product count
    const productCountResult = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(productCategories)
      .where(eq(productCategories.categoryId, id));

    const productCount = productCountResult[0]?.count || 0;

    return {
      ...category,
      productCount,
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error("Failed to fetch category");
  }
}

/**
 * Create a new category
 */
export async function createCategory(data: CategoryFormData) {
  try {
    // Validate input
    const validatedData = categorySchema.parse(data);

    // Check if slug already exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.slug, validatedData.slug),
    });

    if (existingCategory) {
      return {
        success: false,
        error: "A category with this slug already exists",
      };
    }

    // Insert category
    const [category] = await db
      .insert(categories)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        type: validatedData.type,
        isActive: validatedData.isActive,
      })
      .returning();

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products/[id]/edit");

    return {
      success: true,
      categoryId: category.id,
    };
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, data: CategoryFormData) {
  try {
    // Validate input
    const validatedData = categorySchema.parse(data);

    // Check if category exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    // Check if slug is being changed and if it conflicts
    if (validatedData.slug !== existingCategory.slug) {
      const slugConflict = await db.query.categories.findFirst({
        where: eq(categories.slug, validatedData.slug),
      });

      if (slugConflict && slugConflict.id !== id) {
        return {
          success: false,
          error: "A category with this slug already exists",
        };
      }
    }

    // Update category
    await db
      .update(categories)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        type: validatedData.type,
        isActive: validatedData.isActive,
      })
      .where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products/[id]/edit");

    return {
      success: true,
      categoryId: id,
    };
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update category",
    };
  }
}

/**
 * Delete a category (only if not used by any products)
 */
export async function deleteCategory(id: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    // Check if category is used by any products
    const productCountResult = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(productCategories)
      .where(eq(productCategories.categoryId, id));

    const productCount = productCountResult[0]?.count || 0;

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category that is assigned to ${productCount} product${
          productCount > 1 ? "s" : ""
        }`,
      };
    }

    // Delete category
    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products/[id]/edit");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting category:", error);

    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}

/**
 * Toggle category active status
 */
export async function toggleCategoryStatus(id: string, isActive: boolean) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    await db
      .update(categories)
      .set({ isActive })
      .where(eq(categories.id, id));

    revalidatePath("/admin/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error toggling category status:", error);

    return {
      success: false,
      error: "Failed to update category status",
    };
  }
}

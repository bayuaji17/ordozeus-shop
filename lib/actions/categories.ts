"use server";

import { db } from "@/lib/db";
import { categories, productCategories } from "@/lib/db/schema";
import { eq, sql, asc, like, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/category";
import { deleteFromR2 } from "@/lib/r2";
import { requireAdmin } from "@/lib/auth/server";

/**
 * Get all categories with product counts and child counts
 */
export async function getCategories(filters?: {
  search?: string;
  parentId?: string | null;
  level?: number;
  isActive?: boolean | "all";
  page?: number;
  limit?: number;
}) {
  try {
    const {
      search = "",
      parentId,
      level,
      isActive = "all",
      page = 1,
      limit = 10,
    } = filters || {};

    // Get categories with product counts
    let query = db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        level: categories.level,
        displayOrder: categories.displayOrder,
        imageUrl: categories.imageUrl,
        imageKey: categories.imageKey,
        icon: categories.icon,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: sql<number>`cast(count(${productCategories.productId}) as integer)`,
      })
      .from(categories)
      .leftJoin(
        productCategories,
        eq(categories.id, productCategories.categoryId),
      )
      .$dynamic();

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(categories.name, `%${search}%`),
          like(categories.slug, `%${search}%`),
        ),
      );
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        conditions.push(sql`${categories.parentId} IS NULL`);
      } else {
        conditions.push(eq(categories.parentId, parentId));
      }
    }

    if (level !== undefined) {
      conditions.push(eq(categories.level, level));
    }

    if (isActive !== "all") {
      conditions.push(eq(categories.isActive, isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query
      .groupBy(categories.id)
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    // Get child counts for each category
    const childCounts = await db
      .select({
        parentId: categories.parentId,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(categories)
      .where(sql`${categories.parentId} IS NOT NULL`)
      .groupBy(categories.parentId);

    const childCountMap = new Map(
      childCounts.map((c) => [c.parentId, c.count]),
    );

    const allCategories = result.map((cat) => ({
      ...cat,
      childCount: childCountMap.get(cat.id) || 0,
    }));

    const total = allCategories.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedCategories = allCategories.slice(offset, offset + limit);

    return {
      categories: paginatedCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

/**
 * Get category tree (nested structure)
 */
export async function getCategoryTree() {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        level: categories.level,
        displayOrder: categories.displayOrder,
        imageUrl: categories.imageUrl,
        imageKey: categories.imageKey,
        icon: categories.icon,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: sql<number>`cast(count(${productCategories.productId}) as integer)`,
      })
      .from(categories)
      .leftJoin(
        productCategories,
        eq(categories.id, productCategories.categoryId),
      )
      .groupBy(categories.id)
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    // Build tree structure
    type TreeNode = (typeof allCategories)[number] & {
      children: TreeNode[];
    };

    const categoryMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Initialize all nodes
    for (const cat of allCategories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    // Build tree
    for (const cat of allCategories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  } catch (error) {
    console.error("Error fetching category tree:", error);
    throw new Error("Failed to fetch category tree");
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
  await requireAdmin();
  try {
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

    // Auto-calculate level based on parent
    let level = 1;
    if (validatedData.parentId) {
      const parent = await db.query.categories.findFirst({
        where: eq(categories.id, validatedData.parentId),
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const result = (await db
      .insert(categories)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        parentId: validatedData.parentId,
        level,
        displayOrder: validatedData.displayOrder,
        imageUrl: validatedData.imageUrl ?? null,
        imageKey: validatedData.imageKey ?? null,
        icon: validatedData.icon ?? null,
        isActive: validatedData.isActive,
      })
      .returning()) as unknown as { id: string }[];

    const category = result[0];

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products/[id]/edit", "page");

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
  await requireAdmin();
  try {
    const validatedData = categorySchema.parse(data);

    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    // Check slug conflict
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

    // Auto-calculate level based on parent
    let level = 1;
    if (validatedData.parentId) {
      const parent = await db.query.categories.findFirst({
        where: eq(categories.id, validatedData.parentId),
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    await db
      .update(categories)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        parentId: validatedData.parentId,
        level,
        displayOrder: validatedData.displayOrder,
        imageUrl: validatedData.imageUrl ?? null,
        imageKey: validatedData.imageKey ?? null,
        icon: validatedData.icon ?? null,
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));

    // Clean up old image from R2 if it was replaced or removed
    const oldImageKey = existingCategory.imageKey;
    const newImageKey = validatedData.imageKey ?? null;
    if (oldImageKey && oldImageKey !== newImageKey) {
      try {
        await deleteFromR2(oldImageKey);
      } catch (err) {
        console.error("Failed to delete old category image from R2:", err);
      }
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products/[id]/edit", "page");

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
 * Delete a category (only if not used by any products and has no children)
 */
export async function deleteCategory(id: string) {
  await requireAdmin();
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

    // Check if category has children
    const childCountResult = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(categories)
      .where(eq(categories.parentId, id));

    const childCount = childCountResult[0]?.count || 0;

    if (childCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${childCount} child categor${childCount > 1 ? "ies" : "y"}. Delete children first.`,
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
        error: `Cannot delete category assigned to ${productCount} product${productCount > 1 ? "s" : ""}`,
      };
    }

    await db.delete(categories).where(eq(categories.id, id));

    // Clean up image from R2
    if (category.imageKey) {
      try {
        await deleteFromR2(category.imageKey);
      } catch (err) {
        console.error("Failed to delete category image from R2:", err);
      }
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products/[id]/edit", "page");

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
  await requireAdmin();
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
      .set({ isActive, updatedAt: new Date() })
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

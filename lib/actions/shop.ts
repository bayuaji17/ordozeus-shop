"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import {
  products,
  productSizes,
  productCategories,
  categories,
  productImages,
  sizes,
} from "@/lib/db/schema";
import { sql, eq, like, or, and, desc, asc, inArray, gte, lte } from "drizzle-orm";
import type { ShopProduct, CategoryNode, ShopProductsResponse } from "@/lib/types/shop";

export interface ShopFilters {
  categorySlugs?: string[]; // Now accepts slugs instead of IDs
  priceMin?: number | null;
  priceMax?: number | null;
  search?: string;
  sortBy: "name" | "price" | "date";
  sortOrder: "asc" | "desc";
  page: number;
  perPage: number;
}

export async function getShopProducts(filters: ShopFilters): Promise<ShopProductsResponse> {
  try {
    const { categorySlugs, priceMin, priceMax, search, sortBy, sortOrder, page, perPage } = filters;

    const offset = (page - 1) * perPage;

    // Build base query
    let query = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        basePrice: products.basePrice,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(eq(products.status, "active"))
      .$dynamic();

    const conditions = [eq(products.status, "active")];

    // Category filter - include products in selected categories OR their children
    if (categorySlugs && categorySlugs.length > 0) {
      // Get all category IDs (including children) in parallel
      const allCategoryIds = await getAllCategoryIdsFromSlugs(categorySlugs);
      
      if (allCategoryIds.length > 0) {
        const categorySubquery = db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(inArray(productCategories.categoryId, allCategoryIds));

        conditions.push(
          sql`${products.id} IN (${categorySubquery})`
        );
      }
    }

    // Price filter
    if (priceMin !== undefined && priceMin !== null) {
      conditions.push(gte(products.basePrice, priceMin));
    }
    if (priceMax !== undefined && priceMax !== null) {
      conditions.push(lte(products.basePrice, priceMax));
    }

    // Search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      const searchCondition = or(
        like(products.name, searchTerm),
        like(products.slug, searchTerm),
        like(products.description || "", searchTerm)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Apply all conditions
    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    // Sorting
    if (sortBy === "name") {
      query = query.orderBy(sortOrder === "asc" ? asc(products.name) : desc(products.name));
    } else if (sortBy === "price") {
      query = query.orderBy(sortOrder === "asc" ? asc(products.basePrice) : desc(products.basePrice));
    } else {
      query = query.orderBy(sortOrder === "asc" ? asc(products.createdAt) : desc(products.createdAt));
    }

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(products)
      .where(conditions.length > 1 ? and(...conditions) : eq(products.status, "active"));

    const [countResult, productResults] = await Promise.all([
      countQuery,
      query.limit(perPage).offset(offset),
    ]);

    const total = countResult[0]?.count || 0;

    // Fetch related data for products
    const productIds = productResults.map((p) => p.id);

    const [imagesData, sizesData, categoriesData] = await Promise.all([
      // Get primary images
      db
        .select({
          productId: productImages.productId,
          url: productImages.url,
        })
        .from(productImages)
        .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true))),

      // Get sizes with stock
      db
        .select({
          productId: productSizes.productId,
          sizeId: productSizes.id,
          sizeName: sizes.name,
          stock: productSizes.stock,
          sku: productSizes.sku,
        })
        .from(productSizes)
        .innerJoin(sizes, eq(productSizes.sizeId, sizes.id))
        .where(inArray(productSizes.productId, productIds)),

      // Get category names
      db
        .select({
          productId: productCategories.productId,
          categoryName: categories.name,
        })
        .from(productCategories)
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(inArray(productCategories.productId, productIds)),
    ]);

    // Build image lookup
    const imageMap = new Map(imagesData.map((img) => [img.productId, img.url]));

    // Build sizes lookup
    const sizesMap = new Map<string, { id: string; name: string; stock: number; sku: string | null }[]>();
    sizesData.forEach((size) => {
      if (!sizesMap.has(size.productId)) {
        sizesMap.set(size.productId, []);
      }
      sizesMap.get(size.productId)!.push({
        id: size.sizeId,
        name: size.sizeName,
        stock: size.stock,
        sku: size.sku,
      });
    });

    // Build categories lookup
    const categoriesMap = new Map<string, string[]>();
    categoriesData.forEach((cat) => {
      if (!categoriesMap.has(cat.productId)) {
        categoriesMap.set(cat.productId, []);
      }
      categoriesMap.get(cat.productId)!.push(cat.categoryName);
    });

    // Assemble final products
    const shopProducts: ShopProduct[] = productResults.map((product) => ({
      ...product,
      primaryImage: imageMap.get(product.id) || null,
      categories: categoriesMap.get(product.id) || [],
      sizes: sizesMap.get(product.id) || [],
    }));

    return {
      products: shopProducts,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  } catch (error) {
    console.error("Error fetching shop products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Cache for category tree to avoid repeated DB queries
const getCachedCategories = cache(async (): Promise<CategoryNode[]> => {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      parentId: categories.parentId,
      level: categories.level,
      productCount: sql<number>`cast(count(distinct ${productCategories.productId}) as integer)`,
    })
    .from(categories)
    .leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
    .groupBy(categories.id)
    .orderBy(asc(categories.displayOrder), asc(categories.name));

  // Build tree structure
  const categoryMap = new Map<string, CategoryNode>();
  const rootCategories: CategoryNode[] = [];

  // First pass: create nodes
  allCategories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      level: cat.level,
      productCount: cat.productCount,
      children: [],
    });
  });

  // Second pass: build tree
  allCategories.forEach((cat) => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      categoryMap.get(cat.parentId)!.children.push(node);
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
});

// Build a flat map of all categories for quick lookup
async function getCategoryMap(): Promise<Map<string, CategoryNode>> {
  const tree = await getCachedCategories();
  const map = new Map<string, CategoryNode>();
  
  function traverse(nodes: CategoryNode[]) {
    for (const node of nodes) {
      map.set(node.id, node);
      map.set(node.slug, node); // Also index by slug
      if (node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  
  traverse(tree);
  return map;
}

// Get all category IDs (including children) from slugs - optimized with single query
async function getAllCategoryIdsFromSlugs(slugs: string[]): Promise<string[]> {
  const categoryMap = await getCategoryMap();
  const allIds = new Set<string>();
  
  for (const slug of slugs) {
    const category = categoryMap.get(slug);
    if (category) {
      // Add the category itself
      allIds.add(category.id);
      
      // Add all children recursively
      function addChildren(node: CategoryNode) {
        for (const child of node.children) {
          allIds.add(child.id);
          if (child.children.length > 0) {
            addChildren(child);
          }
        }
      }
      
      addChildren(category);
    }
  }
  
  return Array.from(allIds);
}

export async function getCategoriesWithCounts(): Promise<CategoryNode[]> {
  return getCachedCategories();
}

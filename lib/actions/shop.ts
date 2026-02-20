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
import {
  sql,
  eq,
  ne,
  ilike,
  and,
  desc,
  asc,
  inArray,
  gte,
  lte,
  exists,
} from "drizzle-orm";
import type {
  ShopProduct,
  ShopProductDetail,
  ShopProductImage,
  ShopProductSize,
  CategoryNode,
  ShopProductsResponse,
} from "@/lib/types/shop";

export interface ShopFilters {
  categorySlugs?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  search?: string;
  sortBy: "name" | "price" | "date";
  sortOrder: "asc" | "desc";
  page: number;
  perPage: number;
}

/**
 * Main function to fetch shop products with filtering, sorting, and pagination.
 * NOT cached - each filter combination is unique and dynamic.
 */
export async function getShopProducts(
  filters: ShopFilters,
): Promise<ShopProductsResponse> {
  const {
    categorySlugs,
    priceMin,
    priceMax,
    search,
    sortBy,
    sortOrder,
    page,
    perPage,
  } = filters;

  const offset = (page - 1) * perPage;

  // Build conditions array once - single source of truth for all filters
  const conditions = await buildFilterConditions({
    categorySlugs,
    priceMin,
    priceMax,
    search,
  });

  // Create the base where clause - always applies status filter plus any additional conditions
  const whereClause =
    conditions.length > 0
      ? and(eq(products.status, "active"), ...conditions)
      : eq(products.status, "active");

  // Build the main data query with dynamic sorting
  let dataQuery = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      basePrice: products.basePrice,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(whereClause)
    .$dynamic();

  // Apply sorting inline
  if (sortBy === "name") {
    dataQuery = dataQuery.orderBy(
      sortOrder === "asc" ? asc(products.name) : desc(products.name),
    );
  } else if (sortBy === "price") {
    dataQuery = dataQuery.orderBy(
      sortOrder === "asc" ? asc(products.basePrice) : desc(products.basePrice),
    );
  } else {
    dataQuery = dataQuery.orderBy(
      sortOrder === "asc" ? asc(products.createdAt) : desc(products.createdAt),
    );
  }

  // Build count query - uses IDENTICAL where clause for consistency
  const countQuery = db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(products)
    .where(whereClause);

  // Execute count and data queries in parallel
  const [countResult, productResults] = await Promise.all([
    countQuery,
    dataQuery.limit(perPage).offset(offset),
  ]);

  const total = countResult[0]?.count || 0;

  // Early return if no products found
  if (productResults.length === 0) {
    return {
      products: [],
      pagination: { page, perPage, total, totalPages: 0 },
    };
  }

  // Fetch related data in parallel - optimized with single queries
  const productIds = productResults.map((p) => p.id);
  const [imagesData, sizesData, categoriesData] = await Promise.all([
    fetchProductImages(productIds),
    fetchProductSizes(productIds),
    fetchProductCategories(productIds),
  ]);

  // Build lookup maps for efficient assembly
  const imageMap = buildImageMap(imagesData);
  const sizesMap = buildSizesMap(sizesData);
  const categoriesMap = buildCategoriesMap(categoriesData);

  // Assemble final products with related data
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
}

/**
 * Build filter conditions based on user filters.
 * Returns an array of SQL conditions to be combined with AND.
 */
async function buildFilterConditions({
  categorySlugs,
  priceMin,
  priceMax,
  search,
}: {
  categorySlugs?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  search?: string;
}): Promise<SQL[]> {
  const conditions: SQL[] = [];

  // Category filter - includes children categories
  if (categorySlugs && categorySlugs.length > 0) {
    const allCategoryIds = await getAllCategoryIdsFromSlugs(categorySlugs);

    if (allCategoryIds.length > 0) {
      // Use exists() for type-safe subquery instead of raw sql
      conditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(productCategories)
            .where(
              and(
                eq(productCategories.productId, products.id),
                inArray(productCategories.categoryId, allCategoryIds),
              ),
            ),
        ),
      );
    }
  }

  // Price filter - min price
  if (priceMin !== null && priceMin !== undefined) {
    conditions.push(gte(products.basePrice, priceMin));
  }

  // Price filter - max price
  if (priceMax !== null && priceMax !== undefined) {
    conditions.push(lte(products.basePrice, priceMax));
  }

  // Search filter - searches product name ONLY
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(ilike(products.name, searchTerm));
  }

  return conditions;
}

// Helper type for SQL conditions
type SQL = ReturnType<typeof eq>;

/**
 * Fetch primary images for given product IDs.
 */
async function fetchProductImages(productIds: string[]) {
  if (productIds.length === 0) return [];

  return db
    .select({
      productId: productImages.productId,
      url: productImages.url,
    })
    .from(productImages)
    .where(
      and(
        inArray(productImages.productId, productIds),
        eq(productImages.isPrimary, true),
      ),
    );
}

/**
 * Fetch sizes with stock for given product IDs.
 */
async function fetchProductSizes(productIds: string[]) {
  if (productIds.length === 0) return [];

  return db
    .select({
      productId: productSizes.productId,
      sizeId: productSizes.id,
      sizeName: sizes.name,
      stock: productSizes.stock,
      sku: productSizes.sku,
    })
    .from(productSizes)
    .innerJoin(sizes, eq(productSizes.sizeId, sizes.id))
    .where(inArray(productSizes.productId, productIds));
}

/**
 * Fetch category names for given product IDs.
 */
async function fetchProductCategories(productIds: string[]) {
  if (productIds.length === 0) return [];

  return db
    .select({
      productId: productCategories.productId,
      categoryName: categories.name,
    })
    .from(productCategories)
    .innerJoin(categories, eq(productCategories.categoryId, categories.id))
    .where(inArray(productCategories.productId, productIds));
}

/**
 * Build lookup map for product images.
 */
function buildImageMap(imagesData: { productId: string; url: string }[]) {
  return new Map(imagesData.map((img) => [img.productId, img.url]));
}

/**
 * Build lookup map for product sizes.
 */
function buildSizesMap(
  sizesData: {
    productId: string;
    sizeId: string;
    sizeName: string;
    stock: number;
    sku: string | null;
  }[],
) {
  const map = new Map<
    string,
    { id: string; name: string; stock: number; sku: string | null }[]
  >();

  for (const size of sizesData) {
    if (!map.has(size.productId)) {
      map.set(size.productId, []);
    }
    map.get(size.productId)!.push({
      id: size.sizeId,
      name: size.sizeName,
      stock: size.stock,
      sku: size.sku,
    });
  }

  return map;
}

/**
 * Build lookup map for product categories.
 */
function buildCategoriesMap(
  categoriesData: { productId: string; categoryName: string }[],
) {
  const map = new Map<string, string[]>();

  for (const cat of categoriesData) {
    if (!map.has(cat.productId)) {
      map.set(cat.productId, []);
    }
    map.get(cat.productId)!.push(cat.categoryName);
  }

  return map;
}

// ============================================
// CACHED FUNCTIONS - Static data that rarely changes
// ============================================

/**
 * Cached category tree - safe to cache as categories change infrequently.
 * Cache is per-request via React.cache().
 */
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
    .leftJoin(
      productCategories,
      eq(categories.id, productCategories.categoryId),
    )
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

/**
 * Cached category map for quick lookups by ID or slug.
 */
const getCategoryMap = cache(async (): Promise<Map<string, CategoryNode>> => {
  const tree = await getCachedCategories();
  const map = new Map<string, CategoryNode>();

  function traverse(nodes: CategoryNode[]) {
    for (const node of nodes) {
      map.set(node.id, node);
      map.set(node.slug, node);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return map;
});

/**
 * Get all category IDs including children for given slugs.
 * Uses cached category map for efficiency.
 */
const getAllCategoryIdsFromSlugs = cache(
  async (slugs: string[]): Promise<string[]> => {
    const categoryMap = await getCategoryMap();
    const allIds = new Set<string>();

    for (const slug of slugs) {
      const category = categoryMap.get(slug);
      if (category) {
        // Add the category itself
        allIds.add(category.id);

        // Recursively add all children
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
  },
);

/**
 * Public export for category tree with counts.
 * Safe to cache as it changes infrequently.
 */
export async function getCategoriesWithCounts(): Promise<CategoryNode[]> {
  return getCachedCategories();
}

// ============================================
// PRODUCT DETAIL - Cached per-request
// ============================================

/**
 * Fetch single product by slug with full details.
 * Uses React.cache() for per-request deduplication.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<ShopProductDetail | null> => {
    try {
      const product = await db.query.products.findFirst({
        where: and(eq(products.slug, slug), eq(products.status, "active")),
        with: {
          productCategories: {
            with: {
              category: true,
            },
          },
          productImages: {
            orderBy: (images, { asc }) => [asc(images.displayOrder)],
          },
          sizes: {
            with: {
              size: true,
            },
          },
        },
      });

      if (!product) {
        return null;
      }

      // Map images
      const images: ShopProductImage[] = product.productImages.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
      }));

      // Map sizes
      const sizes: ShopProductSize[] = product.sizes.map((s) => ({
        id: s.id,
        name: s.size.name,
        stock: s.stock,
        sku: s.sku,
      }));

      // Get primary image
      const primaryImage =
        product.productImages.find((img) => img.isPrimary)?.url ||
        product.productImages[0]?.url ||
        null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        primaryImage,
        categories: product.productCategories.map((pc) => pc.category.name),
        sizes,
        images,
        createdAt: product.createdAt,
      };
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }
  },
);

/**
 * Fetch related products (same category, excluding current).
 */
export const getRelatedProducts = cache(
  async (
    productId: string,
    categoryNames: string[],
    limit: number = 4,
  ): Promise<ShopProduct[]> => {
    try {
      // Get products in same categories, excluding current
      const related = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          basePrice: products.basePrice,
          createdAt: products.createdAt,
        })
        .from(products)
        .innerJoin(
          productCategories,
          eq(products.id, productCategories.productId),
        )
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(
          and(
            eq(products.status, "active"),
            ne(products.id, productId),
            inArray(
              categories.name,
              categoryNames.length > 0 ? categoryNames : [""],
            ),
          ),
        )
        .groupBy(products.id)
        .orderBy(desc(products.createdAt))
        .limit(limit);

      if (related.length === 0) {
        return [];
      }

      const productIds = related.map((p) => p.id);
      const [imagesData, sizesData] = await Promise.all([
        fetchProductImages(productIds),
        fetchProductSizes(productIds),
      ]);

      const imageMap = buildImageMap(imagesData);
      const sizesMap = buildSizesMap(sizesData);

      return related.map((product) => ({
        ...product,
        primaryImage: imageMap.get(product.id) || null,
        categories: [], // Not needed for related products
        sizes: sizesMap.get(product.id) || [],
      }));
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  },
);

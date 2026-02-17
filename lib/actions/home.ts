"use server";

import { db } from "@/lib/db";
import { products, productImages, categories, productCategories } from "@/lib/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  primaryImage: string | null;
  categories: string[];
}

/**
 * Get featured products for homepage display
 */
export async function getFeaturedProducts(limit: number = 8): Promise<FeaturedProduct[]> {
  try {
    // Get featured products with their primary images
    const featuredProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        basePrice: products.basePrice,
      })
      .from(products)
      .where(
        and(
          eq(products.status, "active"),
          eq(products.isFeatured, true)
        )
      )
      .orderBy(asc(products.displayOrder), desc(products.createdAt))
      .limit(limit);

    // Get primary images for these products
    const productIds = featuredProducts.map((p) => p.id);
    
    let primaryImages: { productId: string; url: string }[] = [];
    let categoryResult: { productId: string; categoryName: string }[] = [];
    
    if (productIds.length > 0) {
      // Get images
      const imagesResult = await db
        .select({
          productId: productImages.productId,
          url: productImages.url,
        })
        .from(productImages)
        .where(
          and(
            sql`${productImages.productId} IN ${productIds}`,
            eq(productImages.isPrimary, true)
          )
        );
      
      primaryImages = imagesResult;

      // Get categories
      categoryResult = await db
        .select({
          productId: productCategories.productId,
          categoryName: categories.name,
        })
        .from(productCategories)
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(sql`${productCategories.productId} IN ${productIds}`);
    }

    // Group categories by product
    const categoriesByProduct = categoryResult.reduce((acc, curr) => {
      if (!acc[curr.productId]) {
        acc[curr.productId] = [];
      }
      acc[curr.productId].push(curr.categoryName);
      return acc;
    }, {} as Record<string, string[]>);

    // Create image lookup map
    const imageMap = primaryImages.reduce((acc, img) => {
      acc[img.productId] = img.url;
      return acc;
    }, {} as Record<string, string>);

    // Combine data
    return featuredProducts.map((product) => ({
      ...product,
      primaryImage: imageMap[product.id] || null,
      categories: categoriesByProduct[product.id] || [],
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export interface CollectionCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}

/**
 * Get top-level categories (gender categories) for collections section
 */
export async function getCollectionCategories(limit: number = 4): Promise<CollectionCategory[]> {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        productCount: sql<number>`cast(count(${productCategories.productId}) as integer)`,
      })
      .from(categories)
      .leftJoin(
        productCategories,
        eq(categories.id, productCategories.categoryId)
      )
      .where(
        and(
          eq(categories.level, 1),
          eq(categories.isActive, true)
        )
      )
      .groupBy(categories.id)
      .orderBy(asc(categories.displayOrder))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("Error fetching collection categories:", error);
    return [];
  }
}

export interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: {
    id: string;
    name: string;
    slug: string;
  }[];
}

/**
 * Get root categories (Level 1) with their Level 2 children
 */
export async function getRootCategoriesWithChildren(limit: number = 8): Promise<CategoryWithChildren[]> {
  try {
    // Get all active root categories (Level 1)
    const rootCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .where(
        and(
          eq(categories.level, 1),
          eq(categories.isActive, true)
        )
      )
      .orderBy(asc(categories.displayOrder))
      .limit(limit);

    if (rootCategories.length === 0) {
      return [];
    }

    // Get Level 2 children for each root category
    const rootCategoryIds = rootCategories.map((cat) => cat.id);
    
    const childrenResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
      })
      .from(categories)
      .where(
        and(
          sql`${categories.parentId} IN ${rootCategoryIds}`,
          eq(categories.level, 2),
          eq(categories.isActive, true)
        )
      )
      .orderBy(asc(categories.displayOrder));

    // Group children by parent
    const childrenByParent = childrenResult.reduce((acc, child) => {
      const parentId = child.parentId;
      if (!parentId) return acc;
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push({
        id: child.id,
        name: child.name,
        slug: child.slug,
      });
      return acc;
    }, {} as Record<string, { id: string; name: string; slug: string }[]>);

    // Combine root categories with their children
    return rootCategories.map((category) => ({
      ...category,
      children: childrenByParent[category.id] || [],
    }));
  } catch (error) {
    console.error("Error fetching root categories with children:", error);
    return [];
  }
}

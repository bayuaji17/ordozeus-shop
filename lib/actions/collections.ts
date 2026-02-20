"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import {
  categories,
  products,
  productCategories,
  productImages,
  productSizes,
  sizes,
} from "@/lib/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import type { CollectionPageData, CollectionSection, CollectionProduct } from "@/lib/types/collections";

const PRODUCTS_PER_SECTION = 10;

/**
 * Get collection data with all sections and their products
 * Uses the "Collection" category as root and its children as sections
 */
export const getCollectionData = cache(async (): Promise<CollectionPageData | null> => {
  // Find Collection root category
  const collectionRoot = await db.query.categories.findFirst({
    where: and(
      eq(categories.name, "Collection"),
      eq(categories.level, 1),
      eq(categories.isActive, true)
    ),
  });

  if (!collectionRoot) {
    return null;
  }

  // Get all active children sections sorted by displayOrder
  const sectionsData = await db.query.categories.findMany({
    where: and(
      eq(categories.parentId, collectionRoot.id),
      eq(categories.isActive, true)
    ),
    orderBy: [asc(categories.displayOrder)],
  });

  if (sectionsData.length === 0) {
    return {
      id: collectionRoot.id,
      name: collectionRoot.name,
      slug: collectionRoot.slug,
      description: collectionRoot.name,
      imageUrl: collectionRoot.imageUrl,
      sections: [],
    };
  }

  // Fetch products for each section
  const sections: CollectionSection[] = await Promise.all(
    sectionsData.map(async (section) => {
      // Get total product count for this section
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(productCategories)
        .innerJoin(products, eq(productCategories.productId, products.id))
        .where(
          and(
            eq(productCategories.categoryId, section.id),
            eq(products.status, "active")
          )
        );

      const totalCount = countResult[0]?.count ?? 0;

      // Get up to 10 active products for this section using raw query approach
      const productsData = await db
        .select({
          product: {
            id: products.id,
            name: products.name,
            slug: products.slug,
            basePrice: products.basePrice,
          },
          imageUrl: productImages.url,
        })
        .from(productCategories)
        .innerJoin(products, eq(productCategories.productId, products.id))
        .leftJoin(
          productImages,
          and(
            eq(productImages.productId, products.id),
            eq(productImages.isPrimary, true)
          )
        )
        .where(
          and(
            eq(productCategories.categoryId, section.id),
            eq(products.status, "active")
          )
        )
        .limit(PRODUCTS_PER_SECTION);

      // Get sizes for each product
      const productIds = productsData.map((p) => p.product.id);

      const sizesData =
        productIds.length > 0
          ? await db
              .select({
                productSizeId: productSizes.id,
                productId: productSizes.productId,
                sizeName: sizes.name,
                stock: productSizes.stock,
              })
              .from(productSizes)
              .innerJoin(sizes, eq(productSizes.sizeId, sizes.id))
              .where(
                and(
                  sql`${productSizes.productId} IN (${sql.join(productIds.map((id) => sql`${id}`), sql`, `)})`,
                  sql`${productSizes.stock} > 0`
                )
              )
          : [];

      // Group sizes by product
      const sizesByProduct = new Map<string, { id: string; name: string; stock: number }[]>();
      for (const size of sizesData) {
        if (!sizesByProduct.has(size.productId)) {
          sizesByProduct.set(size.productId, []);
        }
        sizesByProduct.get(size.productId)!.push({
          id: size.productSizeId,
          name: size.sizeName,
          stock: size.stock,
        });
      }

      // Map to CollectionProduct format
      const productsList: CollectionProduct[] = productsData.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        slug: p.product.slug,
        basePrice: p.product.basePrice,
        primaryImage: p.imageUrl ?? null,
        sizes:
          sizesByProduct
            .get(p.product.id)
            ?.sort((a, b) => a.name.localeCompare(b.name)) ?? [],
      }));

      return {
        id: section.id,
        name: section.name,
        slug: section.slug,
        description: null,
        displayOrder: section.displayOrder,
        imageUrl: section.imageUrl,
        productCount: totalCount,
        products: productsList,
        hasMoreProducts: totalCount > PRODUCTS_PER_SECTION,
      };
    })
  );

  // Filter out sections with no products
  const activeSections = sections.filter((s) => s.products.length > 0);

  return {
    id: collectionRoot.id,
    name: collectionRoot.name,
    slug: collectionRoot.slug,
    description: collectionRoot.name,
    imageUrl: collectionRoot.imageUrl,
    sections: activeSections,
  };
});

/**
 * Get all collection sections for navigation
 */
export const getCollectionSections = cache(async () => {
  const collectionRoot = await db.query.categories.findFirst({
    where: and(
      eq(categories.name, "Collection"),
      eq(categories.level, 1),
      eq(categories.isActive, true)
    ),
  });

  if (!collectionRoot) {
    return [];
  }

  const sections = await db.query.categories.findMany({
    where: and(
      eq(categories.parentId, collectionRoot.id),
      eq(categories.isActive, true)
    ),
    orderBy: [asc(categories.displayOrder)],
    columns: {
      id: true,
      name: true,
      slug: true,
      displayOrder: true,
    },
  });

  return sections;
});

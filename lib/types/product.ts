/**
 * Product domain types
 *
 * Types for products, sizes, and related entities.
 */

import type { WithStatus, ID } from "./common";

// ============================================================================
// Status Enums
// ============================================================================

/**
 * Product status values
 */
export type ProductStatus = "draft" | "active" | "archived";

// ============================================================================
// Product Size Types
// ============================================================================

/**
 * Size master entry
 */
export interface Size {
  id: string;
  name: string;
  sizeTypeId: string;
  sizeTypeName: string;
  sortOrder: number;
}

/**
 * Product-size junction with size details (for display)
 */
export interface ProductSize {
  id: string;
  sizeId: string;
  sizeName: string;
  sizeTypeName: string;
  sku: string | null;
  stock: number;
}

/**
 * Product size input for forms
 */
export interface ProductSizeInput {
  id?: string;
  sizeId: string;
  sku?: string;
  stock: number;
}

// ============================================================================
// Product Image Types
// ============================================================================

/**
 * Product image entity (full)
 */
export interface ProductImageFull {
  id: string;
  productId: string;
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product image for display (minimal fields)
 */
export interface ProductImage {
  id: string;
  url: string;
  key: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

/**
 * Product image for card display
 */
export interface ProductImageCardData {
  id: string;
  url: string;
  fileName: string;
  altText: string | null;
  isPrimary: boolean;
  width: number | null;
  height: number | null;
}

// ============================================================================
// Product Types
// ============================================================================

/**
 * Base product fields (common to all product representations)
 */
export interface ProductBase extends WithStatus<ProductStatus> {
  id: ID;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  isFeatured: boolean;
  displayOrder: number;
}

/**
 * Product for list views (minimal data)
 */
export interface ProductListItem extends ProductBase {
  totalStock: number;
  categoryCount: number;
  sizeCount: number;
}

/**
 * Product with full details for detail pages
 */
export interface ProductDetail extends ProductBase {
  createdAt: Date;
  updatedAt: Date;
  images: ProductImageFull[];
  productCategories: ProductCategoryRelation[];
  sizes: ProductSize[];
}

/**
 * Product data for forms (create/edit)
 */
export interface ProductFormProduct extends ProductBase {
  sizes?: ProductSize[];
  productCategories?: ProductCategoryRelation[];
}

/**
 * Minimal product info for headers
 */
export interface ProductHeaderInfo {
  id: string;
  name: string;
  status: ProductStatus;
}

// ============================================================================
// Product Category Relations
// ============================================================================

/**
 * Category reference within a product
 */
export interface ProductCategoryRelation {
  category: {
    id: string;
    name: string;
    parentId: string | null;
  };
}

// ============================================================================
// Product Filters
// ============================================================================

/**
 * Product list filter options
 */
export interface ProductFilters {
  search?: string;
  status?: ProductStatus | "all";
  stock?: "all" | "in-stock" | "low-stock" | "out-of-stock";
  categoryId?: string;
}

/**
 * Product sort fields
 */
export type ProductSortField =
  | "name"
  | "createdAt"
  | "basePrice"
  | "stock"
  | "status";

/**
 * Product domain types
 *
 * Types for products, variants, options, and related entities.
 */

import type { WithStatus, ID } from "./common";
import type { CategoryGender } from "./category";

// ============================================================================
// Status Enums
// ============================================================================

/**
 * Product status values
 */
export type ProductStatus = "draft" | "active" | "archived";

// ============================================================================
// Product Option Types
// ============================================================================

/**
 * A single option value (e.g., "Small", "Red")
 */
export interface ProductOptionValue {
  id: string;
  value: string;
}

/**
 * A product option type (e.g., "Size", "Color")
 */
export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
}

/**
 * Option data for form builders (without required IDs)
 */
export interface ProductOptionInput {
  id?: string;
  name: string;
  values: Array<{ id?: string; value: string }>;
}

// ============================================================================
// Product Variant Types
// ============================================================================

/**
 * Variant value with full option context (for display)
 */
export interface VariantValueWithOption {
  optionValue: {
    id: string;
    value: string;
    option: {
      id: string;
      name: string;
    };
  };
}

/**
 * A product variant (specific SKU combination) for display
 */
export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  variantValues: VariantValueWithOption[];
}

/**
 * Variant data for preview/editing in forms
 */
export interface VariantPreviewData {
  id?: string;
  sku: string;
  price: number;
  stock: number;
  optionValueIds: string[];
  combination: string; // Display text like "Size: M • Color: Black"
  isActive: boolean;
}

/**
 * Variant input for creating/updating
 */
export interface ProductVariantInput {
  id?: string;
  sku: string;
  price: number;
  stock: number;
  optionValueIds: string[];
  isActive?: boolean;
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
  hasVariant: boolean;
}

/**
 * Product for list views (minimal data)
 */
export interface ProductListItem extends ProductBase {
  stock: number | null;
  totalStock: number; // Aggregated from variants if hasVariant
  categoryCount: number;
  variantCount: number;
}

/**
 * Product with full details for detail pages
 */
export interface ProductDetail extends ProductBase {
  stock: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImageFull[];
  productCategories: ProductCategoryRelation[];
  options: ProductOption[];
  variants: ProductVariant[];
}

/**
 * Product data for forms (create/edit)
 */
export interface ProductFormProduct extends ProductBase {
  stock: number | null;
  options?: ProductOption[];
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
    type: CategoryGender;
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
  hasVariant?: boolean;
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

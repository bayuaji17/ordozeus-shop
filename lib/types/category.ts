/**
 * Category domain types
 *
 * Types for product categories and their relations.
 */

import type { ID } from "./common";

// ============================================================================
// Category Enums
// ============================================================================

/**
 * Gender type for categories
 */
export type CategoryGender = "man" | "woman" | "unisex";

// ============================================================================
// Category Types
// ============================================================================

/**
 * Base category entity
 */
export interface Category {
  id: ID;
  name: string;
  slug: string;
  type: CategoryGender;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category for list views (with product count)
 */
export interface CategoryListItem extends Category {
  productCount: number;
}

/**
 * Category for select dropdowns
 */
export interface CategoryOption {
  id: string;
  name: string;
  type: CategoryGender;
}

/**
 * Categories grouped by gender type
 */
export type CategoriesByGender = Record<CategoryGender, CategoryOption[]>;

// ============================================================================
// Category Filters
// ============================================================================

/**
 * Category list filter options
 */
export interface CategoryFilters {
  search?: string;
  type?: CategoryGender | "all";
  isActive?: boolean;
}

/**
 * Category sort fields
 */
export type CategorySortField = "name" | "createdAt" | "productCount" | "type";

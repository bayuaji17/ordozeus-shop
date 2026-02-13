/**
 * Category domain types
 *
 * Types for hierarchical product categories with self-referencing tree structure.
 */

import type { ID } from "./common";

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
  parentId: string | null;
  level: number;
  displayOrder: number;
  imageUrl: string | null;
  imageKey: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category for list views (with product count and child count)
 */
export interface CategoryListItem extends Category {
  productCount: number;
  childCount: number;
}

/**
 * Category for select dropdowns
 */
export interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
}

/**
 * Category tree node (for nested display)
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  productCount: number;
}

// ============================================================================
// Category Filters
// ============================================================================

/**
 * Category list filter options
 */
export interface CategoryFilters {
  search?: string;
  parentId?: string | null;
  level?: number;
  isActive?: boolean;
}

/**
 * Category sort fields
 */
export type CategorySortField =
  | "name"
  | "createdAt"
  | "productCount"
  | "displayOrder"
  | "level";

/**
 * Inventory domain types
 *
 * Types for inventory management, stock tracking, and movements.
 */

import type { ID } from "./common";
import type { ProductStatus } from "./product";

// ============================================================================
// Movement Enums
// ============================================================================

/**
 * Types of inventory movements
 */
export type MovementType = "in" | "out" | "adjust";

// ============================================================================
// Inventory Item Types
// ============================================================================

/**
 * Inventory item for list/table views
 */
export interface InventoryItem {
  id: ID;
  productId: string;
  productSizeId: string;
  name: string;
  sku: string;
  stock: number;
  status: ProductStatus;
  sizeInfo: string;
  primaryImage: string | null;
  lastMovementAt: Date | null;
}

/**
 * Detailed inventory item with product info
 */
export interface InventoryItemDetail extends InventoryItem {
  basePrice: number;
  productName: string;
  movements: InventoryMovement[];
}

// ============================================================================
// Inventory Movement Types
// ============================================================================

/**
 * Inventory movement record
 */
export interface InventoryMovement {
  id: ID;
  productId: string;
  productSizeId: string | null;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  createdAt: Date;
  createdBy: string | null;
}

/**
 * Movement input for stock adjustments
 */
export interface StockAdjustmentInput {
  productId: string;
  productSizeId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

/**
 * Bulk stock adjustment input
 */
export interface BulkStockAdjustmentInput {
  adjustments: StockAdjustmentInput[];
}

// ============================================================================
// Inventory Filters
// ============================================================================

/**
 * Stock level filter values
 */
export type StockLevelFilter =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";

/**
 * Inventory list filter options
 */
export interface InventoryFilters {
  search?: string;
  stockLevel?: StockLevelFilter;
}

/**
 * Inventory sort fields
 */
export type InventorySortField = "name" | "sku" | "stock" | "lastMovementAt";

// ============================================================================
// Stock Helpers
// ============================================================================

/**
 * Stock level classification
 */
export type StockLevel = "out-of-stock" | "low-stock" | "in-stock";

/**
 * Get stock level based on quantity
 */
export function getStockLevel(stock: number): StockLevel {
  if (stock === 0) return "out-of-stock";
  if (stock <= 10) return "low-stock";
  return "in-stock";
}

/**
 * Stock level color mapping
 */
export const STOCK_LEVEL_COLORS: Record<StockLevel, string> = {
  "out-of-stock": "text-red-600",
  "low-stock": "text-yellow-600",
  "in-stock": "text-green-600",
} as const;

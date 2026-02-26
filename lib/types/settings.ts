/**
 * Settings domain types
 *
 * Types for size configuration, shipping couriers, and locations.
 */

import type { ID } from "./common";

// ============================================================================
// Size Settings Types
// ============================================================================

export interface SizeItem {
  id: ID;
  name: string;
  sizeTypeId: string;
  sizeTypeName: string;
  sortOrder: number;
  productCount: number;
}

export interface SizeTypeItem {
  id: ID;
  name: string;
  sortOrder: number;
  sizeCount: number;
}

// ============================================================================
// Shipping Settings Types
// ============================================================================

export interface CourierItem {
  id: ID;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Courier {
  id: ID;
  name: string;
  code: string;
}

export interface Province {
  id: ID;
  name: string;
}

export interface ShopLocation {
  provinceId?: string | null;
  provinceName?: string | null;
  cityId?: string | null;
  cityName?: string | null;
}

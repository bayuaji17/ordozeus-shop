/**
 * Shared Types - Barrel Export
 *
 * Central export point for all shared types across the application.
 *
 * Usage:
 *   import { ProductListItem, Category, PaginatedResponse } from "@/lib/types";
 *
 * Or import from specific domain:
 *   import { ProductSize } from "@/lib/types/product";
 */

// ============================================================================
// Common Types
// ============================================================================
export type {
  // API Response Types
  ActionResult,
  ActionResultSimple,
  ActionResultWithId,
  // Pagination Types
  PaginationMeta,
  PaginatedResponse,
  PaginationParams,
  // Filter & Sort Types
  SortOrder,
  SortParams,
  QueryParams,
  // Entity Base Types
  BaseEntity,
  SoftDeletable,
  WithStatus,
  Orderable,
  // File & Upload Types
  FileWithPreview,
  UploadedImage,
  ImageUploadResult,
  // Form Types
  FormMode,
  FormProps,
  // Select Option Types
  SelectOption,
  SelectOptionGroup,
  // Utility Types
  PartialBy,
  RequiredBy,
  NonNullableFields,
  ID,
} from "./common";

// ============================================================================
// Product Types
// ============================================================================
export type {
  // Status
  ProductStatus,
  // Size Types
  Size,
  ProductSize,
  ProductSizeInput,
  // Image Types
  ProductImageFull,
  ProductImage,
  ProductImageCardData,
  // Product Types
  ProductBase,
  ProductListItem,
  ProductDetail,
  ProductFormProduct,
  ProductHeaderInfo,
  // Relations
  ProductCategoryRelation,
  // Filters
  ProductFilters,
  ProductSortField,
} from "./product";

// ============================================================================
// Category Types
// ============================================================================
export type {
  Category,
  CategoryListItem,
  CategoryOption,
  CategoryTreeNode,
  CategoryFilters,
  CategorySortField,
} from "./category";

// ============================================================================
// Inventory Types
// ============================================================================
export {
  // Helper function (not a type, so use regular export)
  getStockLevel,
  STOCK_LEVEL_COLORS,
} from "./inventory";

export type {
  MovementType,
  InventoryItem,
  InventoryItemDetail,
  InventoryMovement,
  StockAdjustmentInput,
  BulkStockAdjustmentInput,
  StockLevelFilter,
  InventoryFilters,
  InventorySortField,
  StockLevel,
} from "./inventory";

// ============================================================================
// Carousel Types
// ============================================================================
export type {
  CarouselStatus,
  CarouselSlide,
  CarouselListItem,
  CarouselPublic,
  CarouselFilters,
  CarouselSortField,
  CarouselOrderUpdate,
} from "./carousel";

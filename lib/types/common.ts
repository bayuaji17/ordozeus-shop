/**
 * Common utility types used across the application
 *
 * These are generic, reusable types that don't belong to a specific domain.
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic action result for server actions
 * @template T - The data type returned on success
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Simplified action result without data payload
 */
export type ActionResultSimple =
  | { success: true }
  | { success: false; error: string };

/**
 * Action result with optional ID (common for create operations)
 */
export type ActionResultWithId =
  | { success: true; id: string }
  | { success: false; error: string };

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Generic paginated response
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination input parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

/**
 * Sort direction
 */
export type SortOrder = "asc" | "desc";

/**
 * Generic sort parameters
 * @template T - The allowed sort field names
 */
export interface SortParams<T extends string = string> {
  sortBy?: T;
  sortOrder?: SortOrder;
}

/**
 * Combined filter, sort, and pagination params
 * @template TFilter - Filter fields type
 * @template TSort - Sort field names
 */
export interface QueryParams<
  TFilter extends Record<string, unknown> = Record<string, unknown>,
  TSort extends string = string,
> extends PaginationParams,
    SortParams<TSort> {
  search?: string;
  filters?: TFilter;
}

// ============================================================================
// Entity Base Types
// ============================================================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity with soft delete support
 */
export interface SoftDeletable {
  deletedAt: Date | null;
}

/**
 * Entity with status field
 * @template T - The status enum type
 */
export interface WithStatus<T extends string> {
  status: T;
}

/**
 * Entity with ordering support
 */
export interface Orderable {
  displayOrder: number;
}

// ============================================================================
// File & Upload Types
// ============================================================================

/**
 * File with preview URL (for image uploads)
 */
export interface FileWithPreview {
  file: File;
  preview: string;
  error?: string;
}

/**
 * Uploaded image metadata
 */
export interface UploadedImage {
  url: string;
  key: string;
  fileName?: string;
  size?: number;
}

/**
 * Image upload result
 */
export interface ImageUploadResult {
  success: boolean;
  images?: UploadedImage[];
  errors?: Array<{ fileName: string; error: string }>;
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Form mode for create/edit forms
 */
export type FormMode = "create" | "edit";

/**
 * Generic form props pattern
 * @template T - The entity type being created/edited
 */
export interface FormProps<T> {
  mode: FormMode;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onCancel?: () => void;
}

// ============================================================================
// Select Option Types
// ============================================================================

/**
 * Generic select option
 * @template T - The value type
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Grouped select options
 * @template T - The value type
 */
export interface SelectOptionGroup<T = string> {
  label: string;
  options: SelectOption<T>[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Extract non-nullable type
 */
export type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

/**
 * ID type alias for consistency
 */
export type ID = string;

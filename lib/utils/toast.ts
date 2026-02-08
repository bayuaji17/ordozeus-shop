/**
 * Toast notification utilities
 *
 * Centralized toast patterns for consistent success/error messaging
 */

import { toast } from "sonner";

export const showSuccessToast = {
  productCreated: () => toast.success("Product created successfully"),
  productUpdated: () => toast.success("Product updated successfully"),
  productDeleted: () => toast.success("Product deleted successfully"),
  productStatusUpdated: () => toast.success("Product status updated"),

  categoryCreated: () => toast.success("Category created successfully"),
  categoryUpdated: () => toast.success("Category updated successfully"),
  categoryDeleted: () => toast.success("Category deleted successfully"),

  stockAdjusted: () => toast.success("Stock adjusted successfully"),
  bulkStockAdjusted: (count: number) =>
    toast.success(`${count} stock adjustment${count > 1 ? 's' : ''} applied successfully`),
};

export const showErrorToast = {
  generic: (message?: string) =>
    toast.error(message || "Something went wrong. Please try again."),

  productCreate: (message?: string) =>
    toast.error(message || "Failed to create product"),
  productUpdate: (message?: string) =>
    toast.error(message || "Failed to update product"),
  productDelete: (message?: string) =>
    toast.error(message || "Failed to delete product"),

  categoryCreate: (message?: string) =>
    toast.error(message || "Failed to create category"),
  categoryUpdate: (message?: string) =>
    toast.error(message || "Failed to update category"),
  categoryDelete: (message?: string) =>
    toast.error(message || "Failed to delete category"),
  categoryInUse: () =>
    toast.error("Cannot delete category that is assigned to products"),

  stockAdjustment: (message?: string) =>
    toast.error(message || "Failed to adjust stock"),

  validation: (message: string) =>
    toast.error(message),
};

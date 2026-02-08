import { z } from "zod";

/**
 * Inventory validation schemas
 *
 * Handles stock adjustments and inventory movements.
 */

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID").optional().nullable(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .refine((val) => val !== 0, {
      message: "Quantity cannot be zero",
    }),
  type: z.enum(["in", "out", "adjust"], {
    errorMap: () => ({ message: "Please select a valid adjustment type" }),
  }),
  reason: z
    .string()
    .max(100, "Reason must be 100 characters or less")
    .optional(),
});

export const bulkStockAdjustmentSchema = z.object({
  adjustments: z
    .array(stockAdjustmentSchema)
    .min(1, "At least one adjustment is required"),
});

// Inventory filter schema
export const inventoryFilterSchema = z.object({
  search: z.string().optional(),
  stockLevel: z.enum(["all", "in-stock", "low-stock", "out-of-stock"]).default("all"),
  productType: z.enum(["all", "simple", "variant"]).default("all"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Type exports
export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
export type BulkStockAdjustmentFormData = z.infer<typeof bulkStockAdjustmentSchema>;
export type InventoryFilterData = z.infer<typeof inventoryFilterSchema>;

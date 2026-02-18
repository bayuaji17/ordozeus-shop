import { z } from "zod";

/**
 * Product validation schemas
 *
 * Handles products with a size-based system.
 * Each product has sizes from the master sizes table.
 */

// Product size schema
export const productSizeSchema = z.object({
  id: z.string().uuid().optional(),
  sizeId: z.string().uuid("Size is required"),
  sku: z.string().max(100, "SKU must be 100 characters or less").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

// Product schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be 255 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be 255 characters or less")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
  basePrice: z.number().int().positive("Base price must be positive"),
  status: z.enum(["draft", "active", "archived"]),
  isFeatured: z.boolean(),
  categoryIds: z.array(z.string().uuid()),
  sizes: z.array(productSizeSchema).min(1, "At least one size is required"),
});

// Type exports
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductSizeFormData = z.infer<typeof productSizeSchema>;

// Update schema (allow partial updates)
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

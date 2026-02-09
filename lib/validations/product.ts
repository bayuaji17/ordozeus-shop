import { z } from "zod";

/**
 * Product validation schemas
 *
 * Handles both simple products and products with variants.
 * For variant products, options and their values are validated.
 */

// Product option value schema
export const productOptionValueSchema = z.object({
  id: z.uuid().optional(), // For updates
  value: z
    .string()
    .min(1, "Option value is required")
    .max(50, "Option value must be 50 characters or less"),
});

// Product option schema
export const productOptionSchema = z.object({
  id: z.uuid().optional(), // For updates
  name: z
    .string()
    .min(1, "Option name is required")
    .max(50, "Option name must be 50 characters or less"),
  values: z
    .array(productOptionValueSchema)
    .min(2, "Each option must have at least 2 values"),
});

// Variant preview schema (for pre-generated variants in the form)
export const variantPreviewSchema = z.object({
  id: z.uuid().optional(), // For updates
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(100, "SKU must be 100 characters or less"),
  price: z.number().int().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  // Allow empty strings for new option values (they get IDs after creation)
  optionValueIds: z.array(z.string()),
  isActive: z.boolean().default(true),
});

// Base product schema (common fields)
const baseProductSchema = z.object({
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
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  categoryIds: z.array(z.string().uuid()).default([]),
});

// Simple product schema (no variants)
export const simpleProductSchema = baseProductSchema.extend({
  hasVariant: z.literal(false),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

// Variant product schema
export const variantProductSchema = baseProductSchema.extend({
  hasVariant: z.literal(true),
  options: z
    .array(productOptionSchema)
    .min(1, "Variant products must have at least 1 option"),
  variants: z
    .array(variantPreviewSchema)
    .min(1, "At least one variant must be generated"),
});

// Combined schema - discriminated union
export const productSchema = z.discriminatedUnion("hasVariant", [
  simpleProductSchema,
  variantProductSchema,
]);

// Type exports
export type ProductFormData = z.infer<typeof productSchema>;
export type SimpleProductFormData = z.infer<typeof simpleProductSchema>;
export type VariantProductFormData = z.infer<typeof variantProductSchema>;
export type ProductOption = z.infer<typeof productOptionSchema>;
export type ProductOptionValue = z.infer<typeof productOptionValueSchema>;
export type VariantPreview = z.infer<typeof variantPreviewSchema>;

// Update schemas (allow partial updates)
export const updateSimpleProductSchema = simpleProductSchema.partial().extend({
  id: z.uuid(),
});

export const updateVariantProductSchema = variantProductSchema
  .partial()
  .extend({
    id: z.uuid(),
  });

export const updateProductSchema = z.union([
  updateSimpleProductSchema,
  updateVariantProductSchema,
]);

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

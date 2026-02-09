import { z } from "zod";

/**
 * Category validation schemas
 *
 * Categories are gender-based (man, woman, unisex) and assigned to products.
 */

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  type: z.enum(["man", "woman", "unisex"], {
    message: "Please select a valid gender type",
  }),
  isActive: z.boolean(),
});

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.uuid(),
});

// Type exports
export type CategoryFormData = z.infer<typeof categorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

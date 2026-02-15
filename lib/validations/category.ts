import { z } from "zod";

/**
 * Category validation schemas
 *
 * Categories use a self-referencing tree structure with parentId and level.
 */

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(150, "Slug must be 150 characters or less")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  parentId: z.uuid().nullable(),
  displayOrder: z.number().int().min(0),
  imageUrl: z.url().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  icon: z.string().max(100).nullable().optional(),
  isActive: z.boolean(),
});

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.uuid(),
});

// Type exports
export type CategoryFormData = z.infer<typeof categorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

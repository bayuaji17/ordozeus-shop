import { z } from "zod";

/**
 * Carousel validation schemas
 *
 * Handles validation for carousel management (hero slides/banners)
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Carousel form schema (create/edit)
 */
export const carouselSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be 255 characters or less"),

    subtitle: z
      .string()
      .max(500, "Subtitle must be 500 characters or less")
      .optional()
      .nullable(),

    description: z
      .string()
      .max(2000, "Description must be 2000 characters or less")
      .optional()
      .nullable(),

    imageUrl: z.url("Invalid image URL").optional(),
    imageKey: z.string().optional(),

    ctaText: z
      .string()
      .max(100, "CTA text must be 100 characters or less")
      .optional()
      .nullable(),

    ctaLink: z
      .url("Invalid URL format")
      .max(500, "URL must be 500 characters or less")
      .optional()
      .nullable()
      .or(z.literal("")),

    displayOrder: z
      .number()
      .int()
      .min(0, "Display order must be 0 or greater")
      .default(0),

    status: z
      .enum(["active", "inactive", "scheduled"], {
        message: "Please select a valid status",
      })
      .default("inactive"),

    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),

    titleColor: z
      .string()
      .regex(/^$|^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),

    textColor: z
      .string()
      .regex(/^$|^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),

    buttonBackgroundColor: z
      .string()
      .regex(/^$|^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),

    buttonTextColor: z
      .string()
      .regex(/^$|^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
  })
  .refine(
    (data) => {
      // If both dates are provided, endDate must be after startDate
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

/**
 * Carousel image upload schema
 */
export const carouselImageSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_SIZE, {
    message: `Maximum file size is 5MB`,
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only JPG, PNG, and WebP formats are allowed",
  });

/**
 * Upload carousel image schema
 */
export const uploadCarouselImageSchema = z.object({
  carouselId: z.string("Invalid carousel ID").optional(),
  file: carouselImageSchema,
});

/**
 * Carousel filters schema (for list view)
 */
export const carouselFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive", "scheduled"]).default("all"),
  sortBy: z.enum(["order", "title", "created"]).default("order"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Update carousel order schema
 */
export const updateCarouselOrderSchema = z.object({
  carouselOrders: z
    .array(
      z.object({
        id: z.string("Invalid carousel ID"),
        displayOrder: z.number().int().min(0),
      }),
    )
    .min(1, "At least one carousel is required"),
});

/**
 * Delete carousel schema
 */
export const deleteCarouselSchema = z.object({
  id: z.string("Invalid carousel ID"),
});

/**
 * Toggle carousel status schema
 */
export const toggleCarouselStatusSchema = z.object({
  id: z.string("Invalid carousel ID"),
  status: z.enum(["active", "inactive", "scheduled"]),
});

// Type exports
export type CarouselFormData = z.infer<typeof carouselSchema>;
export type CarouselImageFormData = z.infer<typeof uploadCarouselImageSchema>;
export type CarouselFiltersData = z.infer<typeof carouselFiltersSchema>;
export type UpdateCarouselOrderData = z.infer<typeof updateCarouselOrderSchema>;
export type DeleteCarouselData = z.infer<typeof deleteCarouselSchema>;
export type ToggleCarouselStatusData = z.infer<
  typeof toggleCarouselStatusSchema
>;

// Export constants for client-side use
export const CAROUSEL_VALIDATION = {
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
  MAX_TITLE_LENGTH: 255,
  MAX_SUBTITLE_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_CTA_TEXT_LENGTH: 100,
  MAX_CTA_LINK_LENGTH: 500,
} as const;

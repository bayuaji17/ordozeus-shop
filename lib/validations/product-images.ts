import { z } from "zod";

/**
 * Product Image Validation Schemas
 *
 * Handles validation for image uploads and management
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_PER_PRODUCT = 10;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * File upload validation schema
 */
export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `Maximum file size is 5MB`,
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only JPG, PNG, and WebP formats are allowed",
  });

/**
 * Upload multiple images schema
 */
export const uploadImagesSchema = z.object({
  productId: z.uuid("Invalid product ID"),
  files: z
    .array(imageFileSchema)
    .min(1, "At least one image is required")
    .max(
      MAX_IMAGES_PER_PRODUCT,
      `Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed`,
    ),
});

/**
 * Delete image schema
 */
export const deleteImageSchema = z.object({
  imageId: z.uuid("Invalid image ID"),
  productId: z.uuid("Invalid product ID"),
});

/**
 * Set primary image schema
 */
export const setPrimaryImageSchema = z.object({
  imageId: z.uuid("Invalid image ID"),
  productId: z.uuid("Invalid product ID"),
});

/**
 * Update image order schema
 */
export const updateImageOrderSchema = z.object({
  productId: z.uuid("Invalid product ID"),
  imageOrders: z.array(
    z.object({
      imageId: z.uuid("Invalid image ID"),
      displayOrder: z.number().int().min(0),
    }),
  ),
});

/**
 * Update image alt text schema
 */
export const updateImageAltTextSchema = z.object({
  imageId: z.uuid("Invalid image ID"),
  altText: z
    .string()
    .max(255, "Alt text must be 255 characters or less")
    .optional()
    .nullable(),
});

// Type exports
export type UploadImagesFormData = z.infer<typeof uploadImagesSchema>;
export type DeleteImageFormData = z.infer<typeof deleteImageSchema>;
export type SetPrimaryImageFormData = z.infer<typeof setPrimaryImageSchema>;
export type UpdateImageOrderFormData = z.infer<typeof updateImageOrderSchema>;
export type UpdateImageAltTextFormData = z.infer<
  typeof updateImageAltTextSchema
>;

// Export constants for client-side validation
export const IMAGE_VALIDATION = {
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_PRODUCT,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
} as const;

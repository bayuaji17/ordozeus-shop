/**
 * Utility functions for generating URL-safe slugs
 */

/**
 * Converts a string to a URL-safe slug
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start/end
 *
 * @example
 * generateSlug("T-Shirt Basic") // "t-shirt-basic"
 * generateSlug("Men's Casual Wear!!!") // "mens-casual-wear"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove special characters except hyphens
    .replace(/[^\w-]+/g, "")
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensures slug uniqueness by appending a number if needed
 * Note: This function doesn't check the database - that should be done
 * in the server action. This is just a helper for generating unique slugs.
 *
 * @example
 * ensureUniqueSlug("tshirt", ["tshirt", "tshirt-1"]) // "tshirt-2"
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

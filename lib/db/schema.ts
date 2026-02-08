import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // "admin" or "user"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const genderEnum = pgEnum("gender", ["man", "woman", "unisex"]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const inventoryTypeEnum = pgEnum("inventory_type", [
  "in",
  "out",
  "adjust",
]);

export const carouselStatusEnum = pgEnum("carousel_status", [
  "active",
  "inactive",
  "scheduled",
]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),

  basePrice: integer("base_price").notNull(),

  hasVariant: boolean("has_variant").default(false).notNull(),

  // hanya dipakai jika hasVariant = false
  stock: integer("stock"),

  status: productStatusEnum("status").default("draft").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  // type: varchar("type", { length: 50 }).notNull(),
  type: genderEnum("gender").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const productCategories = pgTable("product_categories", {
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),

  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
});

export const productOptions = pgTable("product_options", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),

  name: varchar("name", { length: 50 }).notNull(),
  // size | color
});
export const productOptionValues = pgTable("product_option_values", {
  id: uuid("id").defaultRandom().primaryKey(),

  optionId: uuid("option_id")
    .references(() => productOptions.id)
    .notNull(),

  value: varchar("value", { length: 50 }).notNull(),
  // M, L, Hitam
});
export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),

  sku: varchar("sku", { length: 100 }).notNull().unique(),

  price: integer("price").notNull(),
  stock: integer("stock").notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const productVariantValues = pgTable("product_variant_values", {
  variantId: uuid("variant_id")
    .references(() => productVariants.id)
    .notNull(),

  optionValueId: uuid("option_value_id")
    .references(() => productOptionValues.id)
    .notNull(),
});
export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),

  variantId: uuid("variant_id").references(() => productVariants.id),

  type: inventoryTypeEnum("type").notNull(),

  quantity: integer("quantity").notNull(),

  reason: varchar("reason", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  // R2 storage details
  url: text("url").notNull(), // Public R2 URL
  key: text("key").notNull(), // R2 object key (for deletion)
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(), // bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(),

  // Image metadata
  width: integer("width"),
  height: integer("height"),
  altText: varchar("alt_text", { length: 255 }),

  // Ordering
  displayOrder: integer("display_order").notNull().default(0),
  isPrimary: boolean("is_primary").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const carousels = pgTable("carousels", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Basic Info
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  description: text("description"),

  // Image (R2 storage)
  imageUrl: text("image_url").notNull(),
  imageKey: text("image_key").notNull(), // R2 object key for deletion

  // Call to Action
  ctaText: varchar("cta_text", { length: 100 }),
  ctaLink: varchar("cta_link", { length: 500 }),

  // Display & Ordering
  displayOrder: integer("display_order").notNull().default(0),

  // Status & Scheduling
  status: carouselStatusEnum("status").default("inactive").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  // Styling (optional)
  backgroundColor: varchar("background_color", { length: 50 }),
  textColor: varchar("text_color", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const productsRelations = relations(products, ({ many }) => ({
  productCategories: many(productCategories),
  productOptions: many(productOptions),
  productVariants: many(productVariants),
  inventoryMovements: many(inventoryMovements),
  productImages: many(productImages),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
  values: many(productOptionValues),
}));

export const productOptionValuesRelations = relations(productOptionValues, ({ one, many }) => ({
  option: one(productOptions, {
    fields: [productOptionValues.optionId],
    references: [productOptions.id],
  }),
  variantValues: many(productVariantValues),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  variantValues: many(productVariantValues),
  inventoryMovements: many(inventoryMovements),
}));

export const productVariantValuesRelations = relations(productVariantValues, ({ one }) => ({
  variant: one(productVariants, {
    fields: [productVariantValues.variantId],
    references: [productVariants.id],
  }),
  optionValue: one(productOptionValues, {
    fields: [productVariantValues.optionValueId],
    references: [productOptionValues.id],
  }),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [inventoryMovements.variantId],
    references: [productVariants.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

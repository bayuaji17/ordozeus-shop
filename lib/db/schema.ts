import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  varchar,
  integer,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

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

// ============================================================================
// AUTH TABLES (UNCHANGED)
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
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

// ============================================================================
// CATEGORY TREE (SELF-RELATION)
// ============================================================================

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),

  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
    onDelete: "cascade",
  }),

  level: integer("level").notNull().default(1), // 1=Gender, 2=Type, 3=Subtype

  displayOrder: integer("display_order").notNull().default(0),

  // Visual Support
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  icon: varchar("icon", { length: 100 }),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// PRODUCTS (NO COMPLEX VARIANT SYSTEM)
// ============================================================================

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),

  basePrice: integer("base_price").notNull(),

  status: productStatusEnum("status").default("draft").notNull(),

  isFeatured: boolean("is_featured").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// SIZE TYPES (MASTER TABLE FOR SIZE CATEGORIES)
// ============================================================================

export const sizeTypes = pgTable("size_types", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 50 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull().unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// SIZE MASTER TABLE (FLEXIBLE SIZE SYSTEM)
// ============================================================================

export const sizes = pgTable("sizes", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 50 }).notNull(),

  sizeTypeId: uuid("size_type_id")
    .notNull()
    .references(() => sizeTypes.id, { onDelete: "restrict" }),

  sortOrder: integer("sort_order").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// PRODUCT SIZES (JOIN WITH SIZE MASTER)
// ============================================================================

export const productSizes = pgTable("product_sizes", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  sizeId: uuid("size_id")
    .notNull()
    .references(() => sizes.id, { onDelete: "restrict" }),

  sku: varchar("sku", { length: 100 }).unique(),

  stock: integer("stock").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// PRODUCT - CATEGORY (PIVOT)
// ============================================================================

export const productCategories = pgTable("product_categories", {
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
});

// ============================================================================
// INVENTORY MOVEMENTS (SIZE-LEVEL TRACKING)
// ============================================================================

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  productSizeId: uuid("product_size_id").references(() => productSizes.id, {
    onDelete: "cascade",
  }),

  type: inventoryTypeEnum("type").notNull(),

  quantity: integer("quantity").notNull(),

  reason: varchar("reason", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),

  url: text("url").notNull(),
  key: text("key").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),

  width: integer("width"),
  height: integer("height"),
  altText: varchar("alt_text", { length: 255 }),

  displayOrder: integer("display_order").notNull().default(0),
  isPrimary: boolean("is_primary").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// COURIERS
// ============================================================================

export const couriers = pgTable("couriers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// CAROUSEL (UNCHANGED)
// ============================================================================

export const carousels = pgTable("carousels", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  description: text("description"),

  imageUrl: text("image_url").notNull(),
  imageKey: text("image_key").notNull(),

  ctaText: varchar("cta_text", { length: 100 }),
  ctaLink: varchar("cta_link", { length: 500 }),

  displayOrder: integer("display_order").notNull().default(0),

  status: carouselStatusEnum("status").default("inactive").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  titleColor: varchar("title_color", { length: 7 }),
  textColor: varchar("text_color", { length: 7 }),
  buttonBackgroundColor: varchar("button_background_color", { length: 7 }),
  buttonTextColor: varchar("button_text_color", { length: 7 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent_children",
  }),
  children: many(categories, { relationName: "category_parent_children" }),
  productCategories: many(productCategories),
}));

export const productsRelations = relations(products, ({ many }) => ({
  productCategories: many(productCategories),
  sizes: many(productSizes),
  inventoryMovements: many(inventoryMovements),
  productImages: many(productImages),
}));

export const sizeTypesRelations = relations(sizeTypes, ({ many }) => ({
  sizes: many(sizes),
}));

export const sizesRelations = relations(sizes, ({ one, many }) => ({
  sizeType: one(sizeTypes, {
    fields: [sizes.sizeTypeId],
    references: [sizeTypes.id],
  }),
  productSizes: many(productSizes),
}));

export const productSizesRelations = relations(
  productSizes,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productSizes.productId],
      references: [products.id],
    }),
    size: one(sizes, {
      fields: [productSizes.sizeId],
      references: [sizes.id],
    }),
    inventoryMovements: many(inventoryMovements),
  }),
);

export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.id],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const inventoryMovementsRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    product: one(products, {
      fields: [inventoryMovements.productId],
      references: [products.id],
    }),
    productSize: one(productSizes, {
      fields: [inventoryMovements.productSizeId],
      references: [productSizes.id],
    }),
  }),
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

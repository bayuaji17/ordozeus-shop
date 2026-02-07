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

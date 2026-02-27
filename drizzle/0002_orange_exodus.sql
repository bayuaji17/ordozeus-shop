CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'EXPIRED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar(50) NOT NULL,
	"product_id" uuid NOT NULL,
	"product_size_id" uuid,
	"product_name" varchar(255) NOT NULL,
	"size_name" varchar(50),
	"price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" text,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"total_amount" integer NOT NULL,
	"ipaymu_session_id" varchar(255),
	"ipaymu_trx_id" varchar(255),
	"ipaymu_payment_url" text,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"shipping_address" text NOT NULL,
	"shipping_city" varchar(100),
	"shipping_province" varchar(100),
	"shipping_postal_code" varchar(20),
	"courier" varchar(50),
	"shipping_cost" integer DEFAULT 0 NOT NULL,
	"tracking_number" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shop_settings" ALTER COLUMN "city_id" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "shop_settings" ALTER COLUMN "district_id" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "shop_settings" ALTER COLUMN "village_id" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_size_id_product_sizes_id_fk" FOREIGN KEY ("product_size_id") REFERENCES "public"."product_sizes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
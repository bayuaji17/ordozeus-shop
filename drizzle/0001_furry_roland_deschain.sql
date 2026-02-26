CREATE TABLE "couriers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "couriers_name_unique" UNIQUE("name"),
	CONSTRAINT "couriers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "shipping_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courier_id" uuid NOT NULL,
	"destination_city_id" varchar(10) NOT NULL,
	"destination_province_id" varchar(10) NOT NULL,
	"base_price" integer NOT NULL,
	"estimated_days" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"province_id" varchar(10),
	"province_name" varchar(100),
	"city_id" varchar(10),
	"city_name" varchar(100),
	"district_id" varchar(10),
	"district_name" varchar(100),
	"village_id" varchar(10),
	"village_name" varchar(250),
	"postal_code" varchar(10),
	"full_address" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "size_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "size_types_name_unique" UNIQUE("name"),
	CONSTRAINT "size_types_sort_order_unique" UNIQUE("sort_order")
);
--> statement-breakpoint
ALTER TABLE "carousels" ALTER COLUMN "text_color" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "carousels" ADD COLUMN "title_color" varchar(7);--> statement-breakpoint
ALTER TABLE "carousels" ADD COLUMN "button_background_color" varchar(7);--> statement-breakpoint
ALTER TABLE "carousels" ADD COLUMN "button_text_color" varchar(7);--> statement-breakpoint
ALTER TABLE "sizes" ADD COLUMN "size_type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_courier_id_couriers_id_fk" FOREIGN KEY ("courier_id") REFERENCES "public"."couriers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sizes" ADD CONSTRAINT "sizes_size_type_id_size_types_id_fk" FOREIGN KEY ("size_type_id") REFERENCES "public"."size_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carousels" DROP COLUMN "background_color";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "display_order";--> statement-breakpoint
ALTER TABLE "sizes" DROP COLUMN "type";
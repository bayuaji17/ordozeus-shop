CREATE TYPE "public"."carousel_status" AS ENUM('active', 'inactive', 'scheduled');--> statement-breakpoint
CREATE TABLE "carousels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" text,
	"description" text,
	"image_url" text NOT NULL,
	"image_key" text NOT NULL,
	"cta_text" varchar(100),
	"cta_link" varchar(500),
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "carousel_status" DEFAULT 'inactive' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"background_color" varchar(50),
	"text_color" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TYPE "public"."photo_role" AS ENUM('main', 'scale', 'detail');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('lille', 'mellem', 'stor');--> statement-breakpoint
CREATE TABLE "closed_dates" (
	"date" date PRIMARY KEY NOT NULL,
	"reason" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_postcodes" (
	"postcode" char(4) PRIMARY KEY NOT NULL,
	"town" text NOT NULL,
	"is_placeholder" boolean DEFAULT true NOT NULL,
	CONSTRAINT "delivery_postcodes_four_digits" CHECK ("delivery_postcodes"."postcode" ~ '^[0-9]{4}$')
);
--> statement-breakpoint
CREATE TABLE "occasion_photos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "occasion_photos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"occasion_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"role" "photo_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occasion_tiers" (
	"occasion_id" integer NOT NULL,
	"tier" "tier" NOT NULL,
	"price_oere" integer NOT NULL,
	"size_text" text NOT NULL,
	"is_placeholder" boolean DEFAULT true NOT NULL,
	CONSTRAINT "occasion_tiers_occasion_id_tier_pk" PRIMARY KEY("occasion_id","tier"),
	CONSTRAINT "occasion_tiers_price_positive" CHECK ("occasion_tiers"."price_oere" > 0)
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "occasions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_sold_out" boolean DEFAULT false NOT NULL,
	"is_placeholder" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "occasions_slug_unique" UNIQUE("slug"),
	CONSTRAINT "occasions_slug_format" CHECK ("occasions"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "occasions_name_not_blank" CHECK (length(trim("occasions"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"delivery_fee_oere" integer NOT NULL,
	"same_day_cutoff" time NOT NULL,
	"delivery_weekdays" integer[] NOT NULL,
	"daily_capacity" integer NOT NULL,
	"pickup_enabled" boolean DEFAULT true NOT NULL,
	"opening_hours" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_placeholder" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_settings_single_row" CHECK ("shop_settings"."id" = 1),
	CONSTRAINT "shop_settings_fee_not_negative" CHECK ("shop_settings"."delivery_fee_oere" >= 0),
	CONSTRAINT "shop_settings_capacity_positive" CHECK ("shop_settings"."daily_capacity" > 0),
	CONSTRAINT "shop_settings_weekdays_valid" CHECK (cardinality("shop_settings"."delivery_weekdays") > 0 and "shop_settings"."delivery_weekdays" <@ array[1,2,3,4,5,6,7])
);
--> statement-breakpoint
ALTER TABLE "occasion_photos" ADD CONSTRAINT "occasion_photos_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasion_tiers" ADD CONSTRAINT "occasion_tiers_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
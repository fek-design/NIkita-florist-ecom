CREATE TYPE "public"."fulfilment" AS ENUM('delivery', 'pickup');--> statement-breakpoint
CREATE TYPE "public"."not_home" AS ENUM('door', 'neighbour', 'call_buyer');--> statement-breakpoint
CREATE TYPE "public"."order_source" AS ENUM('web', 'phone', 'shop');--> statement-breakpoint
CREATE TYPE "public"."payment_channel" AS ENUM('stripe', 'at_pickup', 'in_shop');--> statement-breakpoint
CREATE TYPE "public"."payment_state" AS ENUM('pending', 'paid', 'expired', 'refunded');--> statement-breakpoint
CREATE TABLE "order_lines" (
	"order_id" integer NOT NULL,
	"line_no" smallint NOT NULL,
	"occasion_id" integer NOT NULL,
	"occasion_name" text NOT NULL,
	"tier" "tier" NOT NULL,
	"quantity" smallint NOT NULL,
	"unit_price_oere" integer NOT NULL,
	"card_message" text DEFAULT '' NOT NULL,
	CONSTRAINT "order_lines_order_id_line_no_pk" PRIMARY KEY("order_id","line_no"),
	CONSTRAINT "order_lines_quantity_positive" CHECK ("order_lines"."quantity" > 0),
	CONSTRAINT "order_lines_price_positive" CHECK ("order_lines"."unit_price_oere" > 0),
	CONSTRAINT "order_lines_card_message_length" CHECK (char_length("order_lines"."card_message") <= 200)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "orders_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1),
	"token" text NOT NULL,
	"source" "order_source" NOT NULL,
	"payment_state" "payment_state" DEFAULT 'pending' NOT NULL,
	"payment_channel" "payment_channel" NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_email" text,
	"buyer_phone" text NOT NULL,
	"fulfilment" "fulfilment" NOT NULL,
	"fulfilment_date" date NOT NULL,
	"pickup_slot_hour" smallint,
	"latest_time" time,
	"recipient_name" text,
	"recipient_address" text,
	"recipient_postcode" char(4),
	"recipient_phone" text,
	"not_home" "not_home",
	"comment" text DEFAULT '' NOT NULL,
	"delivery_fee_oere" integer NOT NULL,
	"total_oere" integer NOT NULL,
	"stripe_session_id" text,
	"hold_expires_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number"),
	CONSTRAINT "orders_token_unique" UNIQUE("token"),
	CONSTRAINT "orders_stripeSessionId_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "orders_fee_not_negative" CHECK ("orders"."delivery_fee_oere" >= 0),
	CONSTRAINT "orders_total_positive" CHECK ("orders"."total_oere" > 0),
	CONSTRAINT "orders_web_has_email" CHECK ("orders"."source" <> 'web' or ("orders"."buyer_email" is not null and length(trim("orders"."buyer_email")) > 0)),
	CONSTRAINT "orders_web_pays_online" CHECK (("orders"."source" = 'web') = ("orders"."payment_channel" = 'stripe')),
	CONSTRAINT "orders_phone_is_pickup" CHECK ("orders"."source" <> 'phone' or "orders"."fulfilment" = 'pickup'),
	CONSTRAINT "orders_delivery_has_recipient" CHECK ("orders"."fulfilment" <> 'delivery' or ("orders"."recipient_name" is not null and "orders"."recipient_address" is not null and "orders"."recipient_postcode" ~ '^[0-9]{4}$' and "orders"."not_home" is not null)),
	CONSTRAINT "orders_pickup_has_slot" CHECK (("orders"."fulfilment" = 'pickup') = ("orders"."pickup_slot_hour" is not null)),
	CONSTRAINT "orders_slot_hour_valid" CHECK ("orders"."pickup_slot_hour" is null or "orders"."pickup_slot_hour" between 0 and 23),
	CONSTRAINT "orders_latest_time_delivery_only" CHECK ("orders"."latest_time" is null or "orders"."fulfilment" = 'delivery'),
	CONSTRAINT "orders_pending_has_hold" CHECK ("orders"."payment_state" <> 'pending' or "orders"."hold_expires_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE restrict ON UPDATE no action;
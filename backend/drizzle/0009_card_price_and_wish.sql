ALTER TABLE "order_lines" ADD COLUMN "card_price_oere" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_lines" ADD COLUMN "wish" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_settings" ADD COLUMN "card_price_oere" integer DEFAULT 2000 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_wish_length" CHECK (char_length("order_lines"."wish") <= 200);--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_card_price_not_negative" CHECK ("order_lines"."card_price_oere" >= 0);
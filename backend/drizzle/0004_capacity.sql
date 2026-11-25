ALTER TABLE "shop_settings" ADD COLUMN "pickups_per_slot" smallint DEFAULT 4 NOT NULL;--> statement-breakpoint
CREATE INDEX "orders_fulfilment_date_idx" ON "orders" USING btree ("fulfilment_date","pickup_slot_hour");--> statement-breakpoint
ALTER TABLE "shop_settings" ADD CONSTRAINT "shop_settings_pickups_per_slot_positive" CHECK ("shop_settings"."pickups_per_slot" > 0);
ALTER TABLE "orders" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_stripePaymentIntentId_unique" UNIQUE("stripe_payment_intent_id");
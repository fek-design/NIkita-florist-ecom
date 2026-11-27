// The one place that talks to the payment provider when an order is placed
// (D-016: kept small so a later switch does not touch the rest).
import Stripe from "stripe";
import type { PricedLine } from "../orders/pricing.js";

/** Stripe's shortest Checkout Session is 30 minutes; one more as margin. */
export const SESSION_MINUTES = 31;

export type SessionRequest = {
  orderNumber: number;
  orderToken: string;
  buyerEmail: string;
  lines: PricedLine[];
  deliveryFeeOere: number;
  successUrl: string;
  cancelUrl: string;
  now: Date;
};

export type PaymentProvider = {
  createSession: (
    request: SessionRequest,
  ) => Promise<{ id: string; url: string }>;
};

const TIER_NAME = { lille: "Lille", mellem: "Mellem", stor: "Stor" } as const;

export function stripeProvider(secretKey: string): PaymentProvider {
  const stripe = new Stripe(secretKey);
  return {
    async createSession(request) {
      const lineItems = request.lines.flatMap((line) => [
        {
          quantity: line.quantity,
          price_data: {
            currency: "dkk",
            unit_amount: line.unitPriceOere,
            product_data: {
              name: `${line.occasionName} · ${TIER_NAME[line.tier]}`,
            },
          },
        },
        // The card as its own line, so the payment page shows what it is
        // (occasion-page-choices, design 4a).
        ...(line.cardPriceOere > 0
          ? [
              {
                quantity: line.quantity,
                price_data: {
                  currency: "dkk",
                  unit_amount: line.cardPriceOere,
                  product_data: { name: `Kort til ${line.occasionName}` },
                },
              },
            ]
          : []),
      ]);
      if (request.deliveryFeeOere > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "dkk",
            unit_amount: request.deliveryFeeOere,
            product_data: { name: "Levering" },
          },
        });
      }
      // No payment method list here: the dashboard decides (D-017).
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "dkk",
        locale: "da",
        line_items: lineItems,
        customer_email: request.buyerEmail,
        client_reference_id: String(request.orderNumber),
        metadata: { order_token: request.orderToken },
        expires_at:
          Math.floor(request.now.getTime() / 1000) + SESSION_MINUTES * 60,
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
      });
      if (!session.url) throw new Error("Stripe returned no checkout URL");
      return { id: session.id, url: session.url };
    },
  };
}

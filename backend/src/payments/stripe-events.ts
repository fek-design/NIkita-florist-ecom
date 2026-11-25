// What a Stripe event does to an order (spec orders: "Paid only on
// confirmed payment", "Refunds are recorded"). The event id is stored in the
// same transaction as the change, so a repeated event does nothing and a
// failed change leaves the event unrecorded for Stripe to send again.
import { and, eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";
import type { Db } from "../catalog/queries.js";
import { orders, stripeEvents } from "../db/schema.js";

export type EventOutcome = {
  duplicate: boolean;
  /** Orders that became paid with this event: emails go out for these. */
  paidOrderIds: number[];
};

const idOf = (value: string | { id: string } | null | undefined) =>
  typeof value === "string" ? value : (value?.id ?? null);

export async function applyStripeEvent(
  db: Db,
  event: Stripe.Event,
  now: Date = new Date(),
): Promise<EventOutcome> {
  return db.transaction(async (tx) => {
    const recorded = await tx
      .insert(stripeEvents)
      .values({ id: event.id, type: event.type })
      .onConflictDoNothing()
      .returning({ id: stripeEvents.id });
    if (recorded.length === 0) return { duplicate: true, paidOrderIds: [] };

    const markPaid = async (session: Stripe.Checkout.Session) => {
      const paid = await tx
        .update(orders)
        .set({
          paymentState: "paid",
          paidAt: now,
          stripePaymentIntentId: idOf(session.payment_intent),
          updatedAt: now,
        })
        // Also from expired: if our expiry job ran before a late event,
        // the money was still taken, so the order is paid.
        .where(
          and(
            eq(orders.stripeSessionId, session.id),
            inArray(orders.paymentState, ["pending", "expired"]),
          ),
        )
        .returning({ id: orders.id });
      return paid.map((o) => o.id);
    };

    const markExpired = async (sessionId: string) => {
      await tx
        .update(orders)
        .set({ paymentState: "expired", updatedAt: now })
        .where(
          and(
            eq(orders.stripeSessionId, sessionId),
            eq(orders.paymentState, "pending"),
          ),
        );
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // MobilePay and cards arrive paid; a delayed method arrives "unpaid"
        // and is settled by the async events below.
        if (session.payment_status === "paid") {
          return { duplicate: false, paidOrderIds: await markPaid(session) };
        }
        break;
      }
      case "checkout.session.async_payment_succeeded":
        return {
          duplicate: false,
          paidOrderIds: await markPaid(event.data.object),
        };
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await markExpired(event.data.object.id);
        break;
      case "charge.refunded": {
        const charge = event.data.object;
        const intent = idOf(charge.payment_intent);
        // Only a full refund changes the order; part refunds stay paid.
        if (intent && charge.refunded) {
          await tx
            .update(orders)
            .set({ paymentState: "refunded", updatedAt: now })
            .where(
              and(
                eq(orders.stripePaymentIntentId, intent),
                eq(orders.paymentState, "paid"),
              ),
            );
        }
        break;
      }
      default:
        // Other events are recorded and otherwise ignored.
        break;
    }
    return { duplicate: false, paidOrderIds: [] };
  });
}

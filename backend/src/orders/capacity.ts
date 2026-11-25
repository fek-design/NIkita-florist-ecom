// Capacity: how many orders a day (and, for pickup, an hour slot) can take.
// A pending order holds its place until its payment window closes (spec
// orders: "Capacity is held while paying"). Checking and inserting happen in
// one transaction under a lock per day, so two customers cannot both take
// the last place.
import { and, count, eq, gt, or, sql } from "drizzle-orm";
import type { Db } from "../catalog/queries.js";
import { orderLines, orders, shopSettings } from "../db/schema.js";
import type { PricedLine } from "./pricing.js";

/** How long a pending order holds its place: Stripe's shortest session. */
export const HOLD_MINUTES = 30;

type NewOrder = typeof orders.$inferInsert;

export type PlaceResult =
  | { ok: true; order: typeof orders.$inferSelect }
  | { ok: false; reason: "day_full" | "slot_full" | "no_settings" };

/** Orders that count against capacity at `now`: paid, or pending and held. */
export function counting(now: Date) {
  return or(
    eq(orders.paymentState, "paid"),
    and(eq(orders.paymentState, "pending"), gt(orders.holdExpiresAt, now)),
  );
}

/**
 * Inserts an order and its lines if the day (and the pickup slot) still
 * has room. Web orders arrive pending with a hold; shop and phone orders
 * (DD-21) arrive paid or to be paid at pickup and count from the start.
 */
export async function placeOrder(
  db: Db,
  order: NewOrder,
  lines: PricedLine[],
  now: Date = new Date(),
): Promise<PlaceResult> {
  return db.transaction(async (tx) => {
    // One lock per day: concurrent orders for the same day queue here.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${"orders:" + order.fulfilmentDate}))`,
    );

    const [settings] = await tx
      .select({
        daily: shopSettings.dailyCapacity,
        perSlot: shopSettings.pickupsPerSlot,
      })
      .from(shopSettings);
    if (!settings) return { ok: false, reason: "no_settings" } as const;

    const [day] = await tx
      .select({ n: count() })
      .from(orders)
      .where(
        and(eq(orders.fulfilmentDate, order.fulfilmentDate), counting(now)),
      );
    if ((day?.n ?? 0) >= settings.daily) {
      return { ok: false, reason: "day_full" } as const;
    }

    if (order.fulfilment === "pickup" && order.pickupSlotHour != null) {
      const [slot] = await tx
        .select({ n: count() })
        .from(orders)
        .where(
          and(
            eq(orders.fulfilmentDate, order.fulfilmentDate),
            eq(orders.pickupSlotHour, order.pickupSlotHour),
            counting(now),
          ),
        );
      if ((slot?.n ?? 0) >= settings.perSlot) {
        return { ok: false, reason: "slot_full" } as const;
      }
    }

    const holdExpiresAt =
      (order.paymentState ?? "pending") === "pending"
        ? new Date(now.getTime() + HOLD_MINUTES * 60 * 1000)
        : null;
    const [created] = await tx
      .insert(orders)
      .values({ ...order, holdExpiresAt })
      .returning();
    await tx.insert(orderLines).values(
      lines.map((line) => ({
        orderId: created!.id,
        lineNo: line.lineNo,
        occasionId: line.occasionId,
        occasionName: line.occasionName,
        tier: line.tier,
        quantity: line.quantity,
        unitPriceOere: line.unitPriceOere,
        cardMessage: line.cardMessage,
      })),
    );
    return { ok: true, order: created! } as const;
  });
}

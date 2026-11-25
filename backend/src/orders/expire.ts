// Safety net for missed webhooks (design decision 4): pending orders whose
// hold has run out become expired, so their place is offered again. Counting
// already ignores them; this makes the state honest for the owner's figures.
import { and, eq, lt } from "drizzle-orm";
import type { Db } from "../catalog/queries.js";
import { orders } from "../db/schema.js";

export async function expirePendingOrders(db: Db, now: Date): Promise<number> {
  const expired = await db
    .update(orders)
    .set({ paymentState: "expired", updatedAt: now })
    .where(
      and(eq(orders.paymentState, "pending"), lt(orders.holdExpiresAt, now)),
    )
    .returning({ id: orders.id });
  return expired.length;
}

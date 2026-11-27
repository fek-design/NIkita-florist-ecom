import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { occasions, orders, shopSettings } from "../db/schema.js";
import { HOLD_MINUTES, placeOrder } from "./capacity.js";
import type { PricedLine } from "./pricing.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());

const NOW = new Date("2026-11-23T09:00:00Z");
const later = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);
let line: PricedLine;

beforeEach(async () => {
  await resetCatalog(db);
  await db.insert(shopSettings).values({
    deliveryFeeOere: 8000,
    sameDayCutoff: "12:00",
    deliveryWeekdays: [1, 2, 3, 4, 5, 6],
    dailyCapacity: 2,
    pickupsPerSlot: 1,
  });
  const [occasion] = await db
    .insert(occasions)
    .values({ slug: "bisaettelse", name: "Bisættelse" })
    .returning();
  line = {
    lineNo: 1,
    occasionId: occasion!.id,
    occasionName: "Bisættelse",
    tier: "mellem",
    quantity: 1,
    unitPriceOere: 40000,
    cardMessage: "",
    cardPriceOere: 0,
    wish: "",
  };
});

let n = 0;
const webPickup = (slot: number, date = "2026-11-24") => ({
  token: `t${n++}`,
  source: "web" as const,
  paymentChannel: "stripe" as const,
  buyerName: "Mette",
  buyerEmail: "mette@eksempel.dk",
  buyerPhone: "12345678",
  fulfilment: "pickup" as const,
  fulfilmentDate: date,
  pickupSlotHour: slot,
  deliveryFeeOere: 0,
  totalOere: 40000,
});

describe("placeOrder", () => {
  it("creates a pending order holding its place for the payment window plus a margin", async () => {
    const result = await placeOrder(db, webPickup(14), [line], NOW);
    expect(result.ok).toBe(true);
    expect(result.ok && result.order.holdExpiresAt).toEqual(
      later(HOLD_MINUTES),
    );
  });

  it("refuses a full pickup slot, but offers the next", async () => {
    await placeOrder(db, webPickup(14), [line], NOW);
    expect(await placeOrder(db, webPickup(14), [line], NOW)).toEqual({
      ok: false,
      reason: "slot_full",
    });
    expect((await placeOrder(db, webPickup(15), [line], NOW)).ok).toBe(true);
  });

  it("refuses a full day", async () => {
    await placeOrder(db, webPickup(10), [line], NOW);
    await placeOrder(db, webPickup(11), [line], NOW);
    expect(await placeOrder(db, webPickup(12), [line], NOW)).toEqual({
      ok: false,
      reason: "day_full",
    });
  });

  it("frees the place when the hold has run out", async () => {
    await placeOrder(db, webPickup(14), [line], NOW);
    const afterHold = later(HOLD_MINUTES + 1);
    expect((await placeOrder(db, webPickup(14), [line], afterHold)).ok).toBe(
      true,
    );
  });

  it("keeps counting a paid order after the hold", async () => {
    const first = await placeOrder(db, webPickup(14), [line], NOW);
    await db
      .update(orders)
      .set({ paymentState: "paid" })
      .where(eq(orders.id, first.ok ? first.order.id : -1));
    const afterHold = later(HOLD_MINUTES + 1);
    expect((await placeOrder(db, webPickup(14), [line], afterHold)).ok).toBe(
      false,
    );
  });

  it("stops counting an expired or refunded order", async () => {
    const first = await placeOrder(db, webPickup(14), [line], NOW);
    await db
      .update(orders)
      .set({ paymentState: "expired" })
      .where(eq(orders.id, first.ok ? first.order.id : -1));
    expect((await placeOrder(db, webPickup(14), [line], NOW)).ok).toBe(true);
  });

  it("makes a second customer wait for the first, then refuses the full slot", async () => {
    // Forces the race instead of hoping for it: another connection holds the
    // day's lock while it takes the last place. Our order must wait for that
    // lock, then see the place taken. Without the lock it would not wait.
    const other = connectTestDatabase();
    try {
      let settled = false;
      let ours: ReturnType<typeof placeOrder> | undefined;
      await other.db.transaction(async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${"orders:2026-11-24"}))`,
        );
        await tx.insert(orders).values({
          ...webPickup(14),
          paymentState: "pending",
          holdExpiresAt: later(HOLD_MINUTES),
        });
        ours = placeOrder(db, webPickup(14), [line], NOW);
        void ours.then(() => (settled = true));
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(settled).toBe(false);
      });
      expect(await ours).toEqual({ ok: false, reason: "slot_full" });
    } finally {
      await other.client.end();
    }
  });

  it("counts a phone order paid at pickup from the start (DD-21)", async () => {
    await placeOrder(
      db,
      {
        ...webPickup(14),
        source: "phone",
        paymentChannel: "at_pickup",
        paymentState: "paid",
        buyerEmail: null,
      },
      [line],
      NOW,
    );
    expect(await placeOrder(db, webPickup(14), [line], NOW)).toEqual({
      ok: false,
      reason: "slot_full",
    });
  });
});

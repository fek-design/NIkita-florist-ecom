// The order rules the database enforces on its own (specs: orders,
// checkout), tested against a real Postgres.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { connectTestDatabase } from "../test/test-database.js";
import { PG, pgErrorCode, resetCatalog } from "../test/reset.js";
import { occasions, orderLines, orders } from "./schema.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());
beforeEach(() => resetCatalog(db));

const inHalfAnHour = () => new Date(Date.now() + 30 * 60 * 1000);

/** A valid web delivery order; override fields to break one rule at a time. */
function webDelivery(overrides: Partial<typeof orders.$inferInsert> = {}) {
  return {
    token: `token-${Math.random()}`,
    source: "web" as const,
    paymentChannel: "stripe" as const,
    buyerName: "Mette Jensen",
    buyerEmail: "mette@eksempel.dk",
    buyerPhone: "12345678",
    fulfilment: "delivery" as const,
    fulfilmentDate: "2026-11-24",
    recipientName: "Familien Hansen",
    recipientAddress: "Skovvej 12",
    recipientPostcode: "4300",
    notHome: "door" as const,
    deliveryFeeOere: 8000,
    totalOere: 48000,
    holdExpiresAt: inHalfAnHour(),
    ...overrides,
  };
}

function phonePickup(overrides: Partial<typeof orders.$inferInsert> = {}) {
  return {
    token: `token-${Math.random()}`,
    source: "phone" as const,
    paymentChannel: "at_pickup" as const,
    paymentState: "paid" as const,
    buyerName: "Lise Dam",
    buyerPhone: "40506070",
    fulfilment: "pickup" as const,
    fulfilmentDate: "2026-11-24",
    pickupSlotHour: 14,
    deliveryFeeOere: 0,
    totalOere: 40000,
    ...overrides,
  };
}

describe("orders", () => {
  it("numbers orders from 1001 and starts web orders as pending", async () => {
    const [row] = await db.insert(orders).values(webDelivery()).returning();
    expect(row!.number).toBe(1001);
    expect(row!.paymentState).toBe("pending");
  });

  it("accepts a phone order for pickup without email or address", async () => {
    await expect(
      db.insert(orders).values(phonePickup()),
    ).resolves.toBeDefined();
  });

  it("refuses a web order without email", async () => {
    const code = await pgErrorCode(
      db.insert(orders).values(webDelivery({ buyerEmail: " " })),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses a web order that is not paid through Stripe", async () => {
    const code = await pgErrorCode(
      db.insert(orders).values(webDelivery({ paymentChannel: "in_shop" })),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses a phone order for delivery (phone is pickup only, DD-21)", async () => {
    const code = await pgErrorCode(
      db.insert(orders).values(
        phonePickup({
          fulfilment: "delivery",
          pickupSlotHour: null,
          recipientName: "A",
          recipientAddress: "B",
          recipientPostcode: "4300",
          notHome: "door",
        }),
      ),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses a delivery without the not-home choice", async () => {
    const code = await pgErrorCode(
      db.insert(orders).values(webDelivery({ notHome: null })),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses a pickup without a slot", async () => {
    const code = await pgErrorCode(
      db.insert(orders).values(phonePickup({ pickupSlotHour: null })),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses a latest time on a pickup", async () => {
    const code = await pgErrorCode(
      db.insert(orders).values(phonePickup({ latestTime: "12:30" })),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses a pending order with no hold", async () => {
    const code = await pgErrorCode(
      db.insert(orders).values(webDelivery({ holdExpiresAt: null })),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses the same Stripe session on two orders", async () => {
    await db.insert(orders).values(webDelivery({ stripeSessionId: "cs_1" }));
    const code = await pgErrorCode(
      db.insert(orders).values(webDelivery({ stripeSessionId: "cs_1" })),
    );
    expect(code).toBe(PG.uniqueViolation);
  });
});

describe("order lines", () => {
  async function orderAndOccasion() {
    const [order] = await db.insert(orders).values(webDelivery()).returning();
    const [occasion] = await db
      .insert(occasions)
      .values({ slug: "bisaettelse", name: "Bisættelse" })
      .returning();
    return { orderId: order!.id, occasionId: occasion!.id };
  }

  it("keeps a card message of up to 200 characters", async () => {
    const ids = await orderAndOccasion();
    await expect(
      db.insert(orderLines).values({
        ...ids,
        lineNo: 1,
        occasionName: "Bisættelse",
        tier: "mellem",
        quantity: 1,
        unitPriceOere: 40000,
        cardMessage: "x".repeat(200),
      }),
    ).resolves.toBeDefined();
  });

  it("refuses a card message over 200 characters", async () => {
    const ids = await orderAndOccasion();
    const code = await pgErrorCode(
      db.insert(orderLines).values({
        ...ids,
        lineNo: 1,
        occasionName: "Bisættelse",
        tier: "mellem",
        quantity: 1,
        unitPriceOere: 40000,
        cardMessage: "x".repeat(201),
      }),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses deleting an occasion that has been ordered", async () => {
    const ids = await orderAndOccasion();
    await db.insert(orderLines).values({
      ...ids,
      lineNo: 1,
      occasionName: "Bisættelse",
      tier: "mellem",
      quantity: 1,
      unitPriceOere: 40000,
    });
    const code = await pgErrorCode(
      // An ordered occasion is hidden, never deleted.
      db.delete(occasions).where(eq(occasions.id, ids.occasionId)),
    );
    expect(code).toBe("23503");
  });
});

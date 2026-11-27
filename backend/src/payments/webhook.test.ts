// The Stripe webhook over HTTP, with events signed the way Stripe signs them.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { buildApp } from "../build-app.js";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { occasions, orders, shopSettings } from "../db/schema.js";
import { placeOrder } from "../orders/capacity.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());

const SECRET = "whsec_test_secret";
const STRIPE_LIST = { ips: new Set(["3.18.12.63"]), fetchedAt: 0 };
const NOW = new Date("2026-11-23T09:00:00Z");
const paidCalls: number[][] = [];
const app = buildApp({
  getDatabase: () => db,
  now: () => NOW,
  pingDatabase: async () => 1,
  stripeWebhookSecret: SECRET,
  onPaid: async (ids) => {
    paidCalls.push(ids);
  },
  // Never fetch Stripe's real list in tests.
  getStripeIps: async () => STRIPE_LIST,
  stripeIpCheck: "report",
});

let orderId: number;

beforeEach(async () => {
  paidCalls.length = 0;
  await resetCatalog(db);
  await db.insert(shopSettings).values({
    deliveryFeeOere: 8000,
    sameDayCutoff: "12:00",
    deliveryWeekdays: [1, 2, 3, 4, 5, 6],
    dailyCapacity: 1,
  });
  const [occasion] = await db
    .insert(occasions)
    .values({ slug: "bisaettelse", name: "Bisættelse" })
    .returning();
  const placed = await placeOrder(
    db,
    {
      token: "tok",
      source: "web",
      paymentChannel: "stripe",
      buyerName: "Mette",
      buyerEmail: "mette@eksempel.dk",
      buyerPhone: "12345678",
      fulfilment: "pickup",
      fulfilmentDate: "2026-11-24",
      pickupSlotHour: 14,
      deliveryFeeOere: 0,
      totalOere: 40000,
      stripeSessionId: "cs_test_1",
    },
    [
      {
        lineNo: 1,
        occasionId: occasion!.id,
        occasionName: "Bisættelse",
        tier: "mellem",
        quantity: 1,
        unitPriceOere: 40000,
        cardMessage: "",
        cardPriceOere: 0,
        wish: "",
      },
    ],
    NOW,
  );
  orderId = placed.ok ? placed.order.id : -1;
});

let eventCounter = 0;
function event(type: string, object: Record<string, unknown>, id?: string) {
  return {
    id: id ?? `evt_${eventCounter++}`,
    object: "event",
    type,
    data: { object },
  };
}

async function send(
  body: object,
  secret = SECRET,
  target = app,
  callerIp?: string,
) {
  const payload = JSON.stringify(body);
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return target.inject({
    method: "POST",
    url: "/webhooks/stripe",
    headers: {
      "content-type": "application/json",
      "stripe-signature": header,
      ...(callerIp ? { "x-real-ip": callerIp } : {}),
    },
    payload,
  });
}

const state = async () =>
  (await db.select().from(orders).where(eq(orders.id, orderId)))[0]!;

const completed = (paymentStatus = "paid") =>
  event("checkout.session.completed", {
    id: "cs_test_1",
    object: "checkout.session",
    payment_status: paymentStatus,
    payment_intent: "pi_test_1",
  });

describe("POST /webhooks/stripe", () => {
  it("marks the order paid on a signed completed event and reports it once", async () => {
    const res = await send(completed());
    expect(res.statusCode).toBe(200);
    const order = await state();
    expect(order.paymentState).toBe("paid");
    expect(order.stripePaymentIntentId).toBe("pi_test_1");
    expect(paidCalls).toEqual([[orderId]]);
  });

  it("refuses a forged event and changes nothing", async () => {
    const res = await send(completed(), "whsec_wrong");
    expect(res.statusCode).toBe(400);
    expect((await state()).paymentState).toBe("pending");
    expect(paidCalls).toEqual([]);
  });

  it("refuses an event with no signature", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks/stripe",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify(completed()),
    });
    expect(res.statusCode).toBe(400);
  });

  it("handles the same event twice as once", async () => {
    const same = event(
      "checkout.session.completed",
      { id: "cs_test_1", payment_status: "paid", payment_intent: "pi_test_1" },
      "evt_same",
    );
    await send(same);
    const again = await send(same);
    expect(again.json()).toEqual({ received: true, duplicate: true });
    expect(paidCalls).toEqual([[orderId]]);
  });

  it("waits on an unpaid completion, then pays on the async success", async () => {
    await send(completed("unpaid"));
    expect((await state()).paymentState).toBe("pending");
    await send(
      event("checkout.session.async_payment_succeeded", {
        id: "cs_test_1",
        payment_status: "paid",
        payment_intent: "pi_test_1",
      }),
    );
    expect((await state()).paymentState).toBe("paid");
  });

  it("expires the order when the session expires", async () => {
    await send(event("checkout.session.expired", { id: "cs_test_1" }));
    expect((await state()).paymentState).toBe("expired");
  });

  it("records a full refund, but not a part refund", async () => {
    await send(completed());
    await send(
      event("charge.refunded", {
        payment_intent: "pi_test_1",
        refunded: false,
      }),
    );
    expect((await state()).paymentState).toBe("paid");
    await send(
      event("charge.refunded", { payment_intent: "pi_test_1", refunded: true }),
    );
    expect((await state()).paymentState).toBe("refunded");
  });

  it("accepts and ignores other event types", async () => {
    const res = await send(event("customer.created", { id: "cus_1" }));
    expect(res.statusCode).toBe(200);
    expect((await state()).paymentState).toBe("pending");
  });

  it("answers 503 when the signing secret is missing", async () => {
    const unconfigured = buildApp({
      getDatabase: () => db,
      pingDatabase: async () => 1,
      stripeWebhookSecret: "",
      getStripeIps: async () => STRIPE_LIST,
    });
    const res = await unconfigured.inject({
      method: "POST",
      url: "/webhooks/stripe",
      headers: { "content-type": "application/json", "stripe-signature": "x" },
      payload: "{}",
    });
    expect(res.statusCode).toBe(503);
  });
});

describe("caller address check (second layer)", () => {
  const enforcing = buildApp({
    getDatabase: () => db,
    now: () => NOW,
    pingDatabase: async () => 1,
    stripeWebhookSecret: SECRET,
    getStripeIps: async () => STRIPE_LIST,
    stripeIpCheck: "enforce",
  });

  it("report mode lets an unknown address through (signature still checked)", async () => {
    const res = await send(completed(), SECRET, app, "203.0.113.9");
    expect(res.statusCode).toBe(200);
    expect((await state()).paymentState).toBe("paid");
  });

  it("enforce mode refuses an unknown address and changes nothing", async () => {
    const res = await send(completed(), SECRET, enforcing, "203.0.113.9");
    expect(res.statusCode).toBe(403);
    expect((await state()).paymentState).toBe("pending");
  });

  it("enforce mode accepts Stripe's address", async () => {
    const res = await send(completed(), SECRET, enforcing, "3.18.12.63");
    expect(res.statusCode).toBe(200);
  });

  it("enforce mode still lets events through when the list cannot be fetched", async () => {
    const noList = buildApp({
      getDatabase: () => db,
      now: () => NOW,
      pingDatabase: async () => 1,
      stripeWebhookSecret: SECRET,
      getStripeIps: async () => null,
      stripeIpCheck: "enforce",
    });
    const res = await send(completed(), SECRET, noList, "203.0.113.9");
    expect(res.statusCode).toBe(200);
  });
});

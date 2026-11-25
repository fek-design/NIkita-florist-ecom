// POST /checkout over HTTP, against the seeded test database, with a fake
// payment provider (the real one is tested by hand in test mode, task 2.1).
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../build-app.js";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { seed } from "../db/seed.js";
import { orderLines, orders, shopSettings } from "../db/schema.js";
import type { PaymentProvider, SessionRequest } from "../payments/provider.js";
import { checkForm, type CheckoutBody } from "./checkout.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());

// 10:00 Danish time, Monday 23 Nov 2026.
const NOW = new Date("2026-11-23T09:00:00Z");
const sessions: SessionRequest[] = [];
let failNext = false;
const fakeProvider: PaymentProvider = {
  async createSession(request) {
    if (failNext) throw new Error("Stripe down");
    sessions.push(request);
    return {
      id: `cs_test_${sessions.length}`,
      url: `https://checkout.stripe.test/${sessions.length}`,
    };
  },
};
const app = buildApp({
  getDatabase: () => db,
  now: () => NOW,
  pingDatabase: async () => 1,
  paymentProvider: fakeProvider,
  frontendUrl: "https://shop.test",
  getStripeIps: async () => null,
});

beforeEach(async () => {
  sessions.length = 0;
  failNext = false;
  await resetCatalog(db);
  await seed(db);
});

const delivery = (overrides: Partial<CheckoutBody> = {}): CheckoutBody => ({
  items: [
    {
      slug: "bisaettelse",
      tier: "mellem",
      quantity: 1,
      cardMessage: "Kh. familien",
    },
  ],
  fulfilment: "delivery",
  date: "2026-11-24",
  postcode: "4300",
  buyer: {
    name: "Mette Jensen",
    email: "mette@eksempel.dk",
    emailRepeat: "Mette@Eksempel.dk ",
    phone: "12345678",
  },
  recipient: { name: "Familien Hansen", address: "Skovvej 12" },
  notHome: "door",
  latestTime: "12:30",
  ...overrides,
});

const pickup = (overrides: Partial<CheckoutBody> = {}): CheckoutBody => ({
  ...delivery(),
  fulfilment: "pickup",
  postcode: undefined,
  recipient: undefined,
  notHome: undefined,
  latestTime: undefined,
  pickupSlotHour: 14,
  ...overrides,
});

const post = (body: unknown) =>
  app.inject({ method: "POST", url: "/checkout", payload: body as object });
const codes = (res: Awaited<ReturnType<typeof post>>) =>
  res.json().problems.map((p: { code: string }) => p.code);

describe("POST /checkout", () => {
  it("creates a pending order at the server's price and returns the payment page", async () => {
    const res = await post(delivery());
    expect(res.statusCode).toBe(201);
    expect(res.json().url).toBe("https://checkout.stripe.test/1");

    const [order] = await db.select().from(orders);
    expect(order).toMatchObject({
      paymentState: "pending",
      source: "web",
      totalOere: 48000,
      deliveryFeeOere: 8000,
      stripeSessionId: "cs_test_1",
      latestTime: "12:30:00",
      notHome: "door",
    });
    const lines = await db.select().from(orderLines);
    expect(lines[0]).toMatchObject({
      unitPriceOere: 40000,
      cardMessage: "Kh. familien",
    });

    expect(sessions[0]).toMatchObject({
      buyerEmail: "mette@eksempel.dk",
      deliveryFeeOere: 8000,
      successUrl: `https://shop.test/ordre/${order!.token}`,
    });
  });

  it("ignores amounts sent by the browser", async () => {
    // Unknown fields are dropped before the handler sees them; the price
    // comes from the catalogue only.
    const res = await post({ ...delivery(), totalOere: 1, deliveryFeeOere: 0 });
    expect(res.statusCode).toBe(201);
    const [order] = await db.select().from(orders);
    expect(order!.totalOere).toBe(48000);
    expect(order!.deliveryFeeOere).toBe(8000);
  });

  it("accepts a pickup without address and without a fee", async () => {
    const res = await post(pickup());
    expect(res.statusCode).toBe(201);
    const [order] = await db.select().from(orders);
    expect(order).toMatchObject({
      fulfilment: "pickup",
      pickupSlotHour: 14,
      totalOere: 40000,
    });
  });

  it("refuses emails that do not match", async () => {
    const res = await post(
      delivery({
        buyer: { ...delivery().buyer, emailRepeat: "mette@eksempel.com" },
      }),
    );
    expect(res.statusCode).toBe(422);
    expect(codes(res)).toContain("email_mismatch");
    expect(await db.select().from(orders)).toHaveLength(0);
  });

  it("refuses an unknown occasion by its slug", async () => {
    const res = await post(
      delivery({
        items: [{ slug: "findes-ikke", tier: "mellem", quantity: 1 }],
      }),
    );
    expect(codes(res)).toContain("unknown_occasion");
  });

  it("refuses a delivery outside the zone and offers the reason", async () => {
    const res = await post(delivery({ postcode: "8000" }));
    expect(codes(res)).toContain("outside_zone");
  });

  it("refuses a Sunday and a date past today's cut-off", async () => {
    expect(codes(await post(delivery({ date: "2026-11-29" })))).toContain(
      "date_unavailable",
    );
    const late = buildApp({
      getDatabase: () => db,
      now: () => new Date("2026-11-23T11:30:00Z"), // 12:30 in Denmark
      pingDatabase: async () => 1,
      paymentProvider: fakeProvider,
      getStripeIps: async () => null,
    });
    const res = await late.inject({
      method: "POST",
      url: "/checkout",
      payload: delivery({ date: "2026-11-23" }),
    });
    expect(res.json().problems.map((p: { code: string }) => p.code)).toContain(
      "date_unavailable",
    );
  });

  it("refuses a pickup slot outside opening hours", async () => {
    const res = await post(pickup({ pickupSlotHour: 20 }));
    expect(codes(res)).toContain("slot_unavailable");
  });

  it("answers 409 when the slot is full", async () => {
    await db.update(shopSettings).set({ pickupsPerSlot: 1 });
    expect((await post(pickup())).statusCode).toBe(201);
    const second = await post(pickup());
    expect(second.statusCode).toBe(409);
    expect(codes(second)).toEqual(["slot_full"]);
  });

  it("releases the place when the payment page cannot be made", async () => {
    failNext = true;
    const res = await post(delivery());
    expect(res.statusCode).toBe(502);
    const [order] = await db.select().from(orders);
    expect(order!.paymentState).toBe("expired");
  });

  it("answers 503 when payments are not configured", async () => {
    const unconfigured = buildApp({
      getDatabase: () => db,
      now: () => NOW,
      pingDatabase: async () => 1,
      paymentProvider: null,
      getStripeIps: async () => null,
    });
    const res = await unconfigured.inject({
      method: "POST",
      url: "/checkout",
      payload: delivery(),
    });
    expect(res.statusCode).toBe(503);
  });
});

describe("checkForm", () => {
  const base = (): CheckoutBody => ({
    items: [],
    fulfilment: "delivery",
    date: "2026-11-24",
    postcode: "4300",
    buyer: {
      name: "A",
      email: "a@b.dk",
      emailRepeat: "a@b.dk",
      phone: "12345678",
    },
    recipient: { name: "B", address: "C" },
    notHome: "door",
  });

  it("asks for recipient and not-home on delivery", () => {
    expect(
      checkForm({ ...base(), recipient: undefined, notHome: undefined }).map(
        (p) => p.code,
      ),
    ).toEqual(["recipient_missing", "not_home_missing"]);
  });

  it("refuses a latest time on pickup and asks for a slot", () => {
    expect(
      checkForm({ ...base(), fulfilment: "pickup", latestTime: "12:00" }).map(
        (p) => p.code,
      ),
    ).toEqual(["slot_missing", "latest_time_on_pickup"]);
  });

  it("refuses an email without a domain", () => {
    expect(
      checkForm({
        ...base(),
        buyer: { ...base().buyer, email: "mette@", emailRepeat: "mette@" },
      }).map((p) => p.code),
    ).toEqual(["email_invalid"]);
  });
});

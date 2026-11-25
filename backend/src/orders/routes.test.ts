// The confirmation lookup and the expiry job over HTTP.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../build-app.js";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { seed } from "../db/seed.js";
import { occasions, orders } from "../db/schema.js";
import { HOLD_MINUTES, placeOrder } from "./capacity.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());

const NOW = new Date("2026-11-23T09:00:00Z");
let clock = NOW;
const app = buildApp({
  getDatabase: () => db,
  now: () => clock,
  pingDatabase: async () => 1,
  jobSecret: "job-secret",
  paymentProvider: null,
  getStripeIps: async () => null,
});

const TOKEN = "AbCdEfGhIjKlMnOpQrStUvWx_-12";

beforeEach(async () => {
  clock = NOW;
  await resetCatalog(db);
  await seed(db);
  const [occasion] = await db.select().from(occasions).limit(1);
  await placeOrder(
    db,
    {
      token: TOKEN,
      source: "web",
      paymentChannel: "stripe",
      buyerName: "Mette",
      buyerEmail: "mette@eksempel.dk",
      buyerPhone: "12345678",
      fulfilment: "delivery",
      fulfilmentDate: "2026-11-24",
      latestTime: "12:30",
      recipientName: "Familien Hansen",
      recipientAddress: "Skovvej 12",
      recipientPostcode: "4300",
      notHome: "door",
      deliveryFeeOere: 8000,
      totalOere: 48000,
    },
    [
      {
        lineNo: 1,
        occasionId: occasion!.id,
        occasionName: "Bisættelse",
        tier: "mellem",
        quantity: 1,
        unitPriceOere: 40000,
        cardMessage: "Kh. familien",
      },
    ],
    NOW,
  );
});

describe("GET /orders/:token", () => {
  it("shows the order to whoever holds the token, uncached", async () => {
    const res = await app.inject({ url: `/orders/${TOKEN}` });
    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.json()).toMatchObject({
      number: 1001,
      paymentState: "pending",
      fulfilment: "delivery",
      date: "2026-11-24",
      latestTime: "12:30",
      recipient: { name: "Familien Hansen", postcode: "4300", town: "Holbæk" },
      notHome: "door",
      totalOere: 48000,
      buyerEmail: "mette@eksempel.dk",
      lines: [
        { name: "Bisættelse", tier: "mellem", cardMessage: "Kh. familien" },
      ],
    });
  });

  it("shows nothing for a changed token, or for the order number", async () => {
    expect(
      (await app.inject({ url: `/orders/${TOKEN.replace("A", "B")}` }))
        .statusCode,
    ).toBe(404);
    expect((await app.inject({ url: "/orders/1001" })).statusCode).toBe(400);
  });
});

describe("POST /jobs/expire-orders", () => {
  const run = () =>
    app.inject({
      method: "POST",
      url: "/jobs/expire-orders",
      headers: { authorization: "Bearer job-secret" },
    });

  it("leaves a pending order alone while its hold runs", async () => {
    expect((await run()).json().result).toEqual({ expired: 0 });
  });

  it("expires a pending order after its hold", async () => {
    clock = new Date(NOW.getTime() + (HOLD_MINUTES + 1) * 60_000);
    expect((await run()).json().result).toEqual({ expired: 1 });
    const [order] = await db.select().from(orders);
    expect(order!.paymentState).toBe("expired");
  });

  it("needs the job secret", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/jobs/expire-orders",
    });
    expect(res.statusCode).toBe(401);
  });
});

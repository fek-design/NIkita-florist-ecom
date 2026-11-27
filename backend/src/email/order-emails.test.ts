import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { buildApp } from "../build-app.js";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { seed } from "../db/seed.js";
import { emailOutbox, occasions, orders } from "../db/schema.js";
import { placeOrder } from "../orders/capacity.js";
import {
  danishLongDate,
  escapeHtml,
  sendPaidOrderEmails,
  type Mail,
  type Mailer,
} from "./order-emails.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());

const NOW = new Date("2026-11-23T09:00:00Z");
const sent: Mail[] = [];
let failing = false;
const mailer: Mailer = {
  async send(mail) {
    if (failing) throw new Error("SMTP down");
    sent.push(mail);
  },
};
const settings = { ownerEmail: "owner@localhost" };

async function paidOrder(
  overrides: Partial<typeof orders.$inferInsert> = {},
  card = "Kh. familien",
  wish = "",
) {
  const [occasion] = await db
    .select()
    .from(occasions)
    .where(eq(occasions.slug, "bisaettelse"));
  const placed = await placeOrder(
    db,
    {
      token: `tok-${Math.random()}`,
      source: "web",
      paymentChannel: "stripe",
      paymentState: "paid",
      buyerName: "Mette Jensen",
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
      stripeSessionId: `cs_${Math.random()}`,
      ...overrides,
    },
    [
      {
        lineNo: 1,
        occasionId: occasion!.id,
        occasionName: "Bisættelse",
        tier: "mellem",
        quantity: 1,
        unitPriceOere: 40000,
        cardMessage: card,
        cardPriceOere: card ? 2000 : 0,
        wish,
      },
    ],
    NOW,
  );
  if (!placed.ok) throw new Error(placed.reason);
  return placed.order;
}

beforeEach(async () => {
  sent.length = 0;
  failing = false;
  await resetCatalog(db);
  await seed(db);
});

describe("sendPaidOrderEmails", () => {
  it("prints the wish under its bouquet and the card in a box to cut out", async () => {
    const order = await paidOrder({}, "Kh. familien", "Ingen liljer");
    await sendPaidOrderEmails(db, mailer, [order.id], settings, NOW);

    const slip = sent.find((m) => m.to === "owner@localhost")!;
    expect(slip.text).toContain(
      "BISÆTTELSE · MELLEM\nØNSKE: Ingen liljer\nKORT: Kh. familien",
    );
    expect(slip.html).toContain("✂ KLIP UD");
    expect(slip.html).toContain("border:2px dashed #000");

    const confirmation = sent.find((m) => m.to === "mette@eksempel.dk")!;
    expect(confirmation.text).toContain("Kort: 20 kr.");
    expect(confirmation.text).toContain("Ønske: Ingen liljer");
  });

  it("escapes a wish before it reaches the HTML", async () => {
    const order = await paidOrder({}, "", "<b>røde</b>");
    await sendPaidOrderEmails(db, mailer, [order.id], settings, NOW);
    const slip = sent.find((m) => m.to === "owner@localhost")!;
    expect(slip.html).toContain("&lt;b&gt;røde&lt;/b&gt;");
    expect(slip.html).not.toContain("<b>røde</b>");
  });

  it("sends the confirmation to the buyer and the slip to the owner", async () => {
    const order = await paidOrder();
    const result = await sendPaidOrderEmails(
      db,
      mailer,
      [order.id],
      settings,
      NOW,
    );
    expect(result).toEqual({ queued: 2, sent: 2, failed: 0 });

    const confirmation = sent.find((m) => m.to === "mette@eksempel.dk")!;
    expect(confirmation.subject).toBe("Tak for din bestilling, ordre 1001");
    expect(confirmation.text).toContain("I alt inkl. moms: 480 kr.");
    expect(confirmation.text).toContain(
      "Levering tirsdag 24. november i løbet af dagen, senest kl. 12:30",
    );
    expect(confirmation.text).toContain("Skovvej 12, 4300 Holbæk");
    expect(confirmation.text).toContain('Kortet lyder: "Kh. familien"');

    const slip = sent.find((m) => m.to === "owner@localhost")!;
    expect(slip.text).toContain("LEVERING");
    expect(slip.text).toContain("TIRSDAG 24. NOVEMBER · SENEST KL. 12:30");
    expect(slip.text).toContain("BISÆTTELSE · MELLEM");
    expect(slip.text).toContain("Ikke hjemme: stil den ved døren");
    expect(slip.html).toContain("size:80mm");
  });

  it("never sends the same email twice for an order", async () => {
    const order = await paidOrder();
    await sendPaidOrderEmails(db, mailer, [order.id], settings, NOW);
    const again = await sendPaidOrderEmails(
      db,
      mailer,
      [order.id],
      settings,
      NOW,
    );
    expect(again).toEqual({ queued: 0, sent: 0, failed: 0 });
    expect(sent).toHaveLength(2);
  });

  it("escapes what the customer typed", async () => {
    const order = await paidOrder({}, '<script>alert("x")</script>');
    await sendPaidOrderEmails(db, mailer, [order.id], settings, NOW);
    for (const mail of sent) {
      expect(mail.html).not.toContain("<script>");
      expect(mail.html).toContain("&lt;script&gt;");
    }
  });

  it("keeps a failed email in the outbox for a retry", async () => {
    const order = await paidOrder();
    failing = true;
    const result = await sendPaidOrderEmails(
      db,
      mailer,
      [order.id],
      settings,
      NOW,
    );
    expect(result.failed).toBe(2);
    const rows = await db.select().from(emailOutbox);
    expect(
      rows.every(
        (r) => r.status === "failed" && r.lastError?.includes("SMTP down"),
      ),
    ).toBe(true);
  });

  it("leaves emails pending when no mail settings exist", async () => {
    const order = await paidOrder();
    await sendPaidOrderEmails(db, null, [order.id], settings, NOW);
    const rows = await db.select().from(emailOutbox);
    expect(rows.map((r) => r.status)).toEqual(["pending", "pending"]);
  });

  it("writes a pickup slip with the time slot", async () => {
    const order = await paidOrder({
      fulfilment: "pickup",
      pickupSlotHour: 14,
      latestTime: null,
      recipientName: null,
      recipientAddress: null,
      recipientPostcode: null,
      notHome: null,
      deliveryFeeOere: 0,
      totalOere: 40000,
    });
    await sendPaidOrderEmails(db, mailer, [order.id], settings, NOW);
    const slip = sent.find((m) => m.to === "owner@localhost")!;
    expect(slip.text).toContain("AFHENTNING");
    expect(slip.text).toContain("KL. 14–15");
    expect(sent.find((m) => m.to === "mette@eksempel.dk")!.text).toContain(
      "Afhentning tirsdag 24. november kl. 14–15",
    );
  });
});

describe("from webhook to outbox", () => {
  it("sends both emails once when Stripe says paid, even if Stripe repeats itself", async () => {
    const order = await paidOrder({
      paymentState: "pending",
      stripeSessionId: "cs_test_mail",
    });
    const app = buildApp({
      getDatabase: () => db,
      now: () => NOW,
      pingDatabase: async () => 1,
      stripeWebhookSecret: "whsec_test",
      getStripeIps: async () => null,
      paymentProvider: null,
      mailer,
      ownerEmail: "owner@localhost",
    });
    const payload = JSON.stringify({
      id: "evt_mail",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_mail",
          payment_status: "paid",
          payment_intent: "pi_mail",
        },
      },
    });
    const send = () =>
      app.inject({
        method: "POST",
        url: "/webhooks/stripe",
        headers: {
          "content-type": "application/json",
          "stripe-signature": Stripe.webhooks.generateTestHeaderString({
            payload,
            secret: "whsec_test",
          }),
        },
        payload,
      });
    await send();
    await send();
    expect(sent).toHaveLength(2);
    const [row] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(row!.paymentState).toBe("paid");
  });
});

describe("helpers", () => {
  it("formats Danish dates and escapes HTML", () => {
    expect(danishLongDate("2026-11-24")).toBe("tirsdag 24. november");
    expect(escapeHtml(`<a href="x">'`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;",
    );
  });
});

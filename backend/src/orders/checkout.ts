// POST /checkout (spec checkout): validates the form, prices the order on
// the server, checks the date and pickup slot, holds the place, and opens a
// payment session. The browser is sent to the session's URL.
import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { eq, inArray } from "drizzle-orm";
import type { Db } from "../catalog/queries.js";
import { isAvailableDate, loadDateRules } from "../catalog/dates.js";
import { occasions, orders } from "../db/schema.js";
import type { PaymentProvider } from "../payments/provider.js";
import { placeOrder } from "./capacity.js";
import { getPickupSlots } from "./pickup-slots.js";
import {
  loadPricingCatalog,
  priceOrder,
  type PricingProblem,
} from "./pricing.js";

export type CheckoutBody = {
  items: {
    /** The occasion's public name in addresses; internal ids stay internal. */
    slug: string;
    tier: "lille" | "mellem" | "stor";
    quantity: number;
    cardMessage?: string;
    wish?: string;
  }[];
  fulfilment: "delivery" | "pickup";
  date: string;
  pickupSlotHour?: number;
  postcode?: string;
  buyer: { name: string; email: string; emailRepeat: string; phone: string };
  recipient?: { name: string; address: string; phone?: string };
  notHome?: "door" | "neighbour" | "call_buyer";
  latestTime?: string;
};

/** Problems the form can show next to the right field (in Danish there). */
export type CheckoutProblem =
  | PricingProblem
  | { code: "email_invalid" }
  | { code: "email_mismatch" }
  | { code: "recipient_missing" }
  | { code: "not_home_missing" }
  | { code: "latest_time_on_pickup" }
  | { code: "slot_missing" }
  | { code: "date_unavailable" }
  | { code: "slot_unavailable" };

const text = { type: "string", maxLength: 200 } as const;

const bodySchema = {
  type: "object",
  required: ["items", "fulfilment", "date", "buyer"],
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        required: ["slug", "tier", "quantity"],
        additionalProperties: false,
        properties: {
          slug: {
            type: "string",
            pattern: "^[a-z0-9]+(-[a-z0-9]+)*$",
            maxLength: 80,
          },
          tier: { enum: ["lille", "mellem", "stor"] },
          quantity: { type: "integer" },
          cardMessage: { type: "string", maxLength: 400 },
          wish: { type: "string", maxLength: 400 },
        },
      },
    },
    fulfilment: { enum: ["delivery", "pickup"] },
    date: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" },
    pickupSlotHour: { type: "integer", minimum: 0, maximum: 23 },
    postcode: { type: "string", pattern: "^[0-9]{4}$" },
    buyer: {
      type: "object",
      required: ["name", "email", "emailRepeat", "phone"],
      additionalProperties: false,
      properties: {
        name: { ...text, minLength: 1 },
        email: text,
        emailRepeat: text,
        phone: { type: "string", minLength: 8, maxLength: 20 },
      },
    },
    recipient: {
      type: "object",
      required: ["name", "address"],
      additionalProperties: false,
      properties: {
        name: { ...text, minLength: 1 },
        address: { ...text, minLength: 1 },
        phone: { type: "string", maxLength: 20 },
      },
    },
    notHome: { enum: ["door", "neighbour", "call_buyer"] },
    latestTime: { type: "string", pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$" },
  },
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The form checks that need no database. Pure, for testing. */
export function checkForm(body: CheckoutBody): CheckoutProblem[] {
  const problems: CheckoutProblem[] = [];
  const email = body.buyer.email.trim().toLowerCase();
  if (!EMAIL.test(email)) problems.push({ code: "email_invalid" });
  else if (email !== body.buyer.emailRepeat.trim().toLowerCase()) {
    problems.push({ code: "email_mismatch" });
  }
  if (body.fulfilment === "delivery") {
    if (!body.recipient) problems.push({ code: "recipient_missing" });
    if (!body.notHome) problems.push({ code: "not_home_missing" });
  } else {
    if (body.pickupSlotHour === undefined)
      problems.push({ code: "slot_missing" });
    if (body.latestTime) problems.push({ code: "latest_time_on_pickup" });
  }
  return problems;
}

export type CheckoutRouteOptions = {
  /** Null when the payment keys are not set: checkout answers 503. */
  provider: PaymentProvider | null;
  /** The shop's own address, for Stripe's return links. */
  frontendUrl: string;
};

export function registerCheckoutRoutes(
  app: FastifyInstance,
  getDatabase: () => Db,
  options: CheckoutRouteOptions,
  now: () => Date = () => new Date(),
) {
  app.post<{ Body: CheckoutBody }>(
    "/checkout",
    { schema: { body: bodySchema } },
    async (request, reply) => {
      if (!options.provider) {
        request.log.error("checkout: payment keys are not set");
        return reply.code(503).send({ error: "payments not configured" });
      }
      const body = request.body;
      const at = now();
      const db = getDatabase();

      const problems: CheckoutProblem[] = checkForm(body);
      // Slugs to internal ids; an unknown slug becomes id 0, which pricing
      // reports as an unknown occasion on the right line.
      const slugs = [...new Set(body.items.map((i) => i.slug))];
      const found =
        slugs.length === 0
          ? []
          : await db
              .select({ id: occasions.id, slug: occasions.slug })
              .from(occasions)
              .where(inArray(occasions.slug, slugs));
      const idBySlug = new Map(found.map((o) => [o.slug, o.id]));
      const pricingRequest = {
        items: body.items.map((item) => ({
          occasionId: idBySlug.get(item.slug) ?? 0,
          tier: item.tier,
          quantity: item.quantity,
          cardMessage: item.cardMessage,
          wish: item.wish,
        })),
        fulfilment: body.fulfilment,
        postcode: body.postcode,
      };
      const catalog = await loadPricingCatalog(db, pricingRequest);
      const dateRules = await loadDateRules(db, at);
      if (!catalog || !dateRules) {
        return reply.code(503).send({ error: "delivery settings missing" });
      }
      const priced = priceOrder(pricingRequest, catalog);
      if (!priced.ok) problems.push(...priced.problems);

      if (!isAvailableDate(body.date, dateRules, at)) {
        problems.push({ code: "date_unavailable" });
      } else if (
        body.fulfilment === "pickup" &&
        body.pickupSlotHour !== undefined
      ) {
        const slots = await getPickupSlots(db, body.date, at);
        const slot = slots?.slots.find((s) => s.hour === body.pickupSlotHour);
        if (!slot) problems.push({ code: "slot_unavailable" });
      }

      if (problems.length > 0 || !priced.ok) {
        return reply.code(422).send({ problems });
      }

      const token = randomBytes(24).toString("base64url");
      const delivery = body.fulfilment === "delivery";
      const placed = await placeOrder(
        db,
        {
          token,
          source: "web",
          paymentChannel: "stripe",
          buyerName: body.buyer.name.trim(),
          buyerEmail: body.buyer.email.trim(),
          buyerPhone: body.buyer.phone.trim(),
          fulfilment: body.fulfilment,
          fulfilmentDate: body.date,
          pickupSlotHour: delivery ? null : body.pickupSlotHour,
          latestTime: delivery ? (body.latestTime ?? null) : null,
          recipientName: delivery ? body.recipient!.name.trim() : null,
          recipientAddress: delivery ? body.recipient!.address.trim() : null,
          recipientPostcode: delivery ? body.postcode! : null,
          recipientPhone: delivery
            ? body.recipient!.phone?.trim() || null
            : null,
          notHome: delivery ? body.notHome! : null,
          deliveryFeeOere: priced.deliveryFeeOere,
          totalOere: priced.totalOere,
        },
        priced.lines,
        at,
      );
      if (!placed.ok) {
        // Full day or slot: the form offers another date or time.
        return reply.code(409).send({ problems: [{ code: placed.reason }] });
      }

      try {
        const session = await options.provider.createSession({
          orderNumber: placed.order.number,
          orderToken: token,
          buyerEmail: body.buyer.email.trim(),
          lines: priced.lines,
          deliveryFeeOere: priced.deliveryFeeOere,
          successUrl: `${options.frontendUrl}/ordre/${token}`,
          cancelUrl: `${options.frontendUrl}/betaling?annulleret=1`,
          now: new Date(),
        });
        await db
          .update(orders)
          .set({ stripeSessionId: session.id, updatedAt: at })
          .where(eq(orders.id, placed.order.id));
        return reply.code(201).send({ url: session.url, orderToken: token });
      } catch (error) {
        // No payment page, so release the place at once.
        await db
          .update(orders)
          .set({ paymentState: "expired", updatedAt: at })
          .where(eq(orders.id, placed.order.id));
        request.log.error({ err: error }, "checkout: payment session failed");
        return reply.code(502).send({ error: "payment provider unavailable" });
      }
    },
  );
}

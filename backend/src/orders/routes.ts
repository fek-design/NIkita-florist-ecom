// GET /orders/:token: what the confirmation page (S8) shows. Only someone
// with the unguessable token from the payment return link can read it; the
// public order number is never enough.
import type { FastifyInstance } from "fastify";
import { asc, eq } from "drizzle-orm";
import type { Db } from "../catalog/queries.js";
import { deliveryPostcodes, orderLines, orders } from "../db/schema.js";

const confirmation = {
  type: "object",
  required: [
    "number",
    "paymentState",
    "fulfilment",
    "date",
    "lines",
    "deliveryFeeOere",
    "totalOere",
    "buyerEmail",
  ],
  properties: {
    number: { type: "integer" },
    paymentState: { type: "string" },
    fulfilment: { type: "string" },
    date: { type: "string" },
    pickupSlot: { type: ["string", "null"] },
    latestTime: { type: ["string", "null"] },
    recipient: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          properties: {
            name: { type: "string" },
            address: { type: "string" },
            postcode: { type: "string" },
            town: { type: ["string", "null"] },
          },
        },
      ],
    },
    notHome: { type: ["string", "null"] },
    lines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          tier: { type: "string" },
          quantity: { type: "integer" },
          unitPriceOere: { type: "integer" },
          cardMessage: { type: "string" },
        },
      },
    },
    deliveryFeeOere: { type: "integer" },
    totalOere: { type: "integer" },
    buyerEmail: { type: "string" },
  },
} as const;

export function registerOrderRoutes(
  app: FastifyInstance,
  getDatabase: () => Db,
) {
  app.get<{ Params: { token: string } }>(
    "/orders/:token",
    {
      schema: {
        params: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string", pattern: "^[A-Za-z0-9_-]{20,64}$" },
          },
        },
        response: {
          200: confirmation,
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const db = getDatabase();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.token, request.params.token));
      if (!order) return reply.code(404).send({ error: "not found" });
      const lines = await db
        .select()
        .from(orderLines)
        .where(eq(orderLines.orderId, order.id))
        .orderBy(asc(orderLines.lineNo));
      const [zone] = order.recipientPostcode
        ? await db
            .select({ town: deliveryPostcodes.town })
            .from(deliveryPostcodes)
            .where(eq(deliveryPostcodes.postcode, order.recipientPostcode))
        : [];
      return reply.header("Cache-Control", "no-store").send({
        number: order.number,
        paymentState: order.paymentState,
        fulfilment: order.fulfilment,
        date: order.fulfilmentDate,
        pickupSlot:
          order.pickupSlotHour === null
            ? null
            : `${order.pickupSlotHour}–${order.pickupSlotHour + 1}`,
        latestTime: order.latestTime?.slice(0, 5) ?? null,
        recipient:
          order.fulfilment === "delivery"
            ? {
                name: order.recipientName!,
                address: order.recipientAddress!,
                postcode: order.recipientPostcode!,
                town: zone?.town ?? null,
              }
            : null,
        notHome: order.notHome,
        lines: lines.map((l) => ({
          name: l.occasionName,
          tier: l.tier,
          quantity: l.quantity,
          unitPriceOere: l.unitPriceOere,
          cardMessage: l.cardMessage,
        })),
        deliveryFeeOere: order.deliveryFeeOere,
        totalOere: order.totalOere,
        buyerEmail: order.buyerEmail ?? "",
      });
    },
  );
}

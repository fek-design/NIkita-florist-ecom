// POST /webhooks/stripe. Stripe signs each event; the signature is checked
// against the raw request body before anything in it is trusted.
import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import type { Db } from "../catalog/queries.js";
import { applyStripeEvent, type EventOutcome } from "./stripe-events.js";
import {
  judgeCaller,
  stripeIpSource,
  type IpCheckMode,
  type IpList,
} from "./stripe-ips.js";

export type PaymentRouteOptions = {
  /** Stripe's signing secret for this endpoint (STRIPE_WEBHOOK_SECRET). */
  webhookSecret: string;
  /** Called with the orders that became paid (emails, task 5.1). */
  onPaid?: (orderIds: number[]) => Promise<void>;
  /** Second layer: Stripe's published addresses (see stripe-ips.ts). */
  ipCheck?: IpCheckMode;
  getStripeIps?: (now: number) => Promise<IpList | null>;
  /** True outside Vercel, where `stripe listen` calls from localhost. */
  isLocal?: boolean;
};

export function registerPaymentRoutes(
  app: FastifyInstance,
  getDatabase: () => Db,
  options: PaymentRouteOptions,
  now: () => Date = () => new Date(),
) {
  // An isolated plugin, so only this route keeps the body as raw bytes.
  void app.register(async (scope) => {
    scope.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_request, body, done) => done(null, body),
    );

    const getIps = options.getStripeIps ?? stripeIpSource();

    scope.post("/webhooks/stripe", async (request, reply) => {
      // Vercel sets x-real-ip to the caller's address; locally, the socket's.
      const forwarded = request.headers["x-real-ip"];
      const ip = typeof forwarded === "string" ? forwarded : request.ip;
      const verdict = judgeCaller(
        ip,
        await getIps(now().getTime()),
        options.ipCheck ?? "report",
        options.isLocal ?? false,
      );
      if (!verdict.allow) {
        request.log.warn({ ip }, "stripe webhook refused: unknown caller");
        return reply.code(403).send({ error: "forbidden" });
      }
      if (verdict.note === "unknown_caller") {
        request.log.warn({ ip }, "stripe webhook from an unknown address");
      } else if (verdict.note === "list_unavailable") {
        request.log.error("stripe webhook: Stripe's IP list is unavailable");
      }

      if (!options.webhookSecret) {
        request.log.error("STRIPE_WEBHOOK_SECRET is not set");
        return reply.code(503).send({ error: "payments not configured" });
      }
      const signature = request.headers["stripe-signature"];
      let event: Stripe.Event;
      try {
        event = Stripe.webhooks.constructEvent(
          request.body as Buffer,
          typeof signature === "string" ? signature : "",
          options.webhookSecret,
        );
      } catch {
        // Repeated failures mean an attack or a wrong secret: watch the log.
        request.log.warn({ ip }, "stripe webhook: invalid signature");
        return reply.code(400).send({ error: "invalid signature" });
      }

      const outcome: EventOutcome = await applyStripeEvent(
        getDatabase(),
        event,
        now(),
      );
      if (outcome.paidOrderIds.length > 0 && options.onPaid) {
        await options.onPaid(outcome.paidOrderIds);
      }
      return reply.send({ received: true, duplicate: outcome.duplicate });
    });
  });
}

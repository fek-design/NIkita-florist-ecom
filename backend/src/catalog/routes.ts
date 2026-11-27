// Read-only catalogue routes for the storefront. Every response is declared
// with a JSON schema: Fastify only serialises the declared fields, so internal
// values (such as the daily capacity) can never leak into a response.
import type { FastifyInstance } from "fastify";
import { danishDate } from "../lib/danish-time.js";
import { getPickupSlots } from "../orders/pickup-slots.js";
import { availableDates, loadDateRules } from "./dates.js";
import {
  checkPostcode,
  findPlaces,
  getDeliveryRules,
  getOccasion,
  listOccasions,
  type Db,
} from "./queries.js";

/** Public data may be cached briefly by Vercel's edge, sparing the database. */
const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

const notFound = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;

const photo = {
  type: "object",
  required: ["url", "alt"],
  properties: { url: { type: "string" }, alt: { type: "string" } },
} as const;

const occasionSummary = {
  type: "object",
  required: [
    "slug",
    "name",
    "intro",
    "fromPriceOere",
    "soldOut",
    "placeholder",
    "mainPhoto",
  ],
  properties: {
    slug: { type: "string" },
    name: { type: "string" },
    intro: { type: "string" },
    fromPriceOere: { type: "integer" },
    soldOut: { type: "boolean" },
    placeholder: { type: "boolean" },
    mainPhoto: { anyOf: [photo, { type: "null" }] },
  },
} as const;

const occasionDetail = {
  type: "object",
  required: [
    "slug",
    "name",
    "intro",
    "description",
    "soldOut",
    "placeholder",
    "tiers",
    "photos",
  ],
  properties: {
    slug: { type: "string" },
    name: { type: "string" },
    intro: { type: "string" },
    description: { type: "string" },
    soldOut: { type: "boolean" },
    placeholder: { type: "boolean" },
    tiers: {
      type: "array",
      items: {
        type: "object",
        required: ["tier", "priceOere", "sizeText", "placeholder"],
        properties: {
          tier: { type: "string", enum: ["lille", "mellem", "stor"] },
          priceOere: { type: "integer" },
          sizeText: { type: "string" },
          placeholder: { type: "boolean" },
        },
      },
    },
    photos: {
      type: "array",
      items: {
        type: "object",
        required: ["url", "alt", "role"],
        properties: {
          url: { type: "string" },
          alt: { type: "string" },
          role: { type: "string", enum: ["main", "scale", "detail"] },
        },
      },
    },
  },
} as const;

const hours = {
  type: "array",
  items: { type: "string" },
  minItems: 2,
  maxItems: 2,
} as const;

const deliveryRules = {
  type: "object",
  required: [
    "deliveryFeeOere",
    "sameDayCutoff",
    "deliveryWeekdays",
    "closedDates",
    "pickupEnabled",
    "cardPriceOere",
    "openingHours",
    "placeholder",
  ],
  properties: {
    deliveryFeeOere: { type: "integer" },
    sameDayCutoff: { type: "string" },
    deliveryWeekdays: { type: "array", items: { type: "integer" } },
    closedDates: {
      type: "array",
      items: {
        type: "object",
        required: ["date", "reason"],
        properties: { date: { type: "string" }, reason: { type: "string" } },
      },
    },
    pickupEnabled: { type: "boolean" },
    cardPriceOere: { type: "integer" },
    openingHours: {
      type: "object",
      properties: {
        mon: hours,
        tue: hours,
        wed: hours,
        thu: hours,
        fri: hours,
        sat: hours,
        sun: hours,
      },
      additionalProperties: false,
    },
    placeholder: { type: "boolean" },
  },
} as const;

const postcodeCheck = {
  type: "object",
  required: ["postcode", "inZone", "town", "feeOere", "pickupOffered"],
  properties: {
    postcode: { type: "string" },
    inZone: { type: "boolean" },
    town: { type: ["string", "null"] },
    feeOere: { type: ["integer", "null"] },
    pickupOffered: { type: "boolean" },
  },
} as const;

const settingsMissing = { error: "delivery settings missing" };

const pickupSlotsResponse = {
  type: "object",
  required: ["date", "slots", "placeholder"],
  properties: {
    date: { type: "string" },
    placeholder: { type: "boolean" },
    slots: {
      type: "array",
      items: {
        type: "object",
        required: ["hour", "label", "available"],
        properties: {
          hour: { type: "integer" },
          label: { type: "string" },
          available: { type: "boolean" },
        },
      },
    },
  },
} as const;

export function registerCatalogRoutes(
  app: FastifyInstance,
  getDatabase: () => Db,
  now: () => Date = () => new Date(),
) {
  app.get(
    "/occasions",
    {
      schema: {
        response: {
          200: {
            type: "object",
            required: ["occasions"],
            properties: {
              occasions: { type: "array", items: occasionSummary },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const list = await listOccasions(getDatabase());
      return reply
        .header("Cache-Control", PUBLIC_CACHE)
        .send({ occasions: list });
    },
  );

  app.get<{ Params: { slug: string } }>(
    "/occasions/:slug",
    { schema: { response: { 200: occasionDetail, 404: notFound } } },
    async (request, reply) => {
      const occasion = await getOccasion(getDatabase(), request.params.slug);
      if (!occasion) return reply.code(404).send({ error: "not found" });
      return reply.header("Cache-Control", PUBLIC_CACHE).send(occasion);
    },
  );

  app.get(
    "/delivery",
    { schema: { response: { 200: deliveryRules, 503: notFound } } },
    async (_request, reply) => {
      const rules = await getDeliveryRules(getDatabase(), danishDate(now()));
      if (!rules) return reply.code(503).send(settingsMissing);
      return reply.header("Cache-Control", PUBLIC_CACHE).send(rules);
    },
  );

  // Pickup slots change as orders come in, so they are never cached.
  app.get<{ Querystring: { date: string } }>(
    "/pickup/slots",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["date"],
          properties: {
            date: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" },
          },
        },
        response: { 200: pickupSlotsResponse, 503: notFound },
      },
    },
    async (request, reply) => {
      const { date } = request.query;
      const result = await getPickupSlots(getDatabase(), date, now());
      if (!result) return reply.code(503).send(settingsMissing);
      return reply
        .header("Cache-Control", "no-store")
        .send({ date, ...result });
    },
  );

  // Dates change at the cut-off, so the cache is short; checkout checks the
  // chosen date again in any case.
  app.get(
    "/delivery/dates",
    {
      schema: {
        response: {
          200: {
            type: "object",
            required: ["dates"],
            properties: {
              dates: {
                type: "array",
                items: { type: "string", format: "date" },
              },
            },
          },
          503: notFound,
        },
      },
    },
    async (_request, reply) => {
      const at = now();
      const rules = await loadDateRules(getDatabase(), at);
      if (!rules) return reply.code(503).send(settingsMissing);
      return reply
        .header("Cache-Control", "public, s-maxage=60")
        .send({ dates: availableDates(rules, at) });
    },
  );

  // Suggestions while typing a town or postcode (occasion-page-choices).
  app.get<{ Querystring: { q: string } }>(
    "/delivery/places",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["q"],
          properties: { q: { type: "string", maxLength: 40 } },
        },
        response: {
          200: {
            type: "object",
            required: ["places"],
            properties: {
              places: {
                type: "array",
                items: {
                  type: "object",
                  required: ["postcode", "town"],
                  properties: {
                    postcode: { type: "string" },
                    town: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const places = await findPlaces(getDatabase(), request.query.q);
      return reply.header("Cache-Control", PUBLIC_CACHE).send({ places });
    },
  );

  app.get<{ Params: { postcode: string } }>(
    "/delivery/postcodes/:postcode",
    {
      schema: {
        params: {
          type: "object",
          required: ["postcode"],
          properties: { postcode: { type: "string", pattern: "^[0-9]{4}$" } },
        },
        response: { 200: postcodeCheck, 503: notFound },
      },
    },
    async (request, reply) => {
      const result = await checkPostcode(
        getDatabase(),
        request.params.postcode,
      );
      if (!result) return reply.code(503).send(settingsMissing);
      return reply.header("Cache-Control", PUBLIC_CACHE).send(result);
    },
  );
}

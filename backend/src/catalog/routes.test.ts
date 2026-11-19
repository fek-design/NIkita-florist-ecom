// The catalogue routes over HTTP (app.inject) against the seeded test database.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { buildApp } from "../build-app.js";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { seed } from "../db/seed.js";
import {
  closedDates,
  occasions,
  occasionTiers,
  shopSettings,
} from "../db/schema.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());

// 10:00 Danish time on 19 Nov 2026.
const app = buildApp({
  getDatabase: () => db,
  now: () => new Date("2026-11-19T09:00:00Z"),
  pingDatabase: async () => 1,
});

beforeEach(async () => {
  await resetCatalog(db);
  await seed(db);
});

describe("GET /occasions", () => {
  it("lists visible occasions in order, cacheable for a minute", async () => {
    const res = await app.inject({ method: "GET", url: "/occasions" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toContain("s-maxage=60");
    const { occasions: list } = res.json();
    expect(list).toHaveLength(5);
    expect(list[0]).toEqual({
      slug: "fodselsdag",
      name: "Fødselsdag",
      intro: "Buketter til fødselsdagen i tre størrelser.",
      fromPriceOere: 25000,
      soldOut: false,
      placeholder: true,
      mainPhoto: null,
    });
  });
});

describe("GET /occasions/:slug", () => {
  it("returns the occasion with its three tiers", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/occasions/bare-fordi",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.tiers).toEqual([
      {
        tier: "lille",
        priceOere: 20000,
        sizeText: "Lille buket",
        placeholder: true,
      },
      {
        tier: "mellem",
        priceOere: 30000,
        sizeText: "Mellem buket",
        placeholder: true,
      },
      {
        tier: "stor",
        priceOere: 45000,
        sizeText: "Stor buket",
        placeholder: true,
      },
    ]);
    expect(Object.keys(body)).not.toContain("id");
  });

  it("answers 404 for hidden, incomplete and unknown addresses", async () => {
    await db
      .update(occasions)
      .set({ isVisible: false })
      .where(eq(occasions.slug, "tak"));
    const [love] = await db
      .select({ id: occasions.id })
      .from(occasions)
      .where(eq(occasions.slug, "kaerlighed"));
    await db
      .delete(occasionTiers)
      .where(
        and(
          eq(occasionTiers.occasionId, love!.id),
          eq(occasionTiers.tier, "mellem"),
        ),
      );
    for (const slug of ["tak", "kaerlighed", "findes-ikke"]) {
      const res = await app.inject({
        method: "GET",
        url: `/occasions/${slug}`,
      });
      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ error: "not found" });
    }
  });
});

describe("GET /delivery", () => {
  it("publishes the rules, closed dates from today on, and never the capacity", async () => {
    await db.insert(closedDates).values([
      { date: "2026-11-18", reason: "I går" },
      { date: "2026-12-24", reason: "Juleaften" },
    ]);
    const res = await app.inject({ method: "GET", url: "/delivery" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      deliveryFeeOere: 8000,
      sameDayCutoff: "12:00",
      deliveryWeekdays: [1, 2, 3, 4, 5, 6],
      closedDates: [{ date: "2026-12-24", reason: "Juleaften" }],
      pickupEnabled: true,
      openingHours: {},
      placeholder: true,
    });
    expect(res.body).not.toMatch(/capacity/i);
  });

  it("answers 503 when the settings row is missing", async () => {
    await db.delete(shopSettings);
    const res = await app.inject({ method: "GET", url: "/delivery" });
    expect(res.statusCode).toBe(503);
  });
});

describe("GET /delivery/postcodes/:postcode", () => {
  it("4300: delivery for 80 kr., and pickup offered", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/delivery/postcodes/4300",
    });
    expect(res.json()).toEqual({
      postcode: "4300",
      inZone: true,
      town: "Holbæk",
      feeOere: 8000,
      pickupOffered: true,
    });
  });

  it("8000: no delivery, pickup offered", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/delivery/postcodes/8000",
    });
    expect(res.json()).toMatchObject({ inZone: false, pickupOffered: true });
  });

  it("43a0: 400, naming the postcode as the problem", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/delivery/postcodes/43a0",
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().message).toMatch(/postcode/);
  });
});

describe("server errors", () => {
  it("answer without SQL or other internal detail", async () => {
    const broken = buildApp({
      getDatabase: () => {
        throw new Error(
          'Failed query: select "delivery_fee_oere" from "shop_settings" (postgres://user:hunter2@db)',
        );
      },
      pingDatabase: async () => 1,
    });
    const res = await broken.inject({
      method: "GET",
      url: "/delivery/postcodes/4300",
    });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: "internal error" });
    expect(res.body).not.toMatch(/select|shop_settings|hunter2/);
  });
});

// The catalogue rules the database enforces on its own (spec: "Occasions are
// sold in three tiers"), tested against a real Postgres.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { connectTestDatabase } from "../test/test-database.js";
import { PG, pgErrorCode, resetCatalog } from "../test/reset.js";
import {
  deliveryPostcodes,
  occasions,
  occasionTiers,
  shopSettings,
} from "./schema.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());
beforeEach(() => resetCatalog(db));

async function newOccasion(slug = "foedselsdag") {
  const [row] = await db
    .insert(occasions)
    .values({ slug, name: "Fødselsdag" })
    .returning({ id: occasions.id });
  return row!.id;
}

const settings = {
  deliveryFeeOere: 8000,
  sameDayCutoff: "12:00",
  deliveryWeekdays: [1, 2, 3, 4, 5, 6],
  dailyCapacity: 15,
};

describe("occasion tiers", () => {
  it("allows one row per tier per occasion", async () => {
    const id = await newOccasion();
    await db
      .insert(occasionTiers)
      .values({
        occasionId: id,
        tier: "lille",
        priceOere: 25000,
        sizeText: "ca. 30 cm",
      });
    const code = await pgErrorCode(
      db
        .insert(occasionTiers)
        .values({
          occasionId: id,
          tier: "lille",
          priceOere: 26000,
          sizeText: "ca. 30 cm",
        }),
    );
    expect(code).toBe(PG.uniqueViolation);
  });

  it("refuses a price of zero", async () => {
    const id = await newOccasion();
    const code = await pgErrorCode(
      db
        .insert(occasionTiers)
        .values({
          occasionId: id,
          tier: "lille",
          priceOere: 0,
          sizeText: "ca. 30 cm",
        }),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("refuses prices that do not rise from lille to stor", async () => {
    const id = await newOccasion();
    await db
      .insert(occasionTiers)
      .values({
        occasionId: id,
        tier: "lille",
        priceOere: 30000,
        sizeText: "ca. 30 cm",
      });
    const code = await pgErrorCode(
      db
        .insert(occasionTiers)
        .values({
          occasionId: id,
          tier: "mellem",
          priceOere: 30000,
          sizeText: "ca. 40 cm",
        }),
    );
    expect(code).toBe(PG.checkViolation);
  });

  it("allows raising all prices in one transaction, checked at commit", async () => {
    const id = await newOccasion();
    await db.insert(occasionTiers).values([
      {
        occasionId: id,
        tier: "lille",
        priceOere: 25000,
        sizeText: "ca. 30 cm",
      },
      {
        occasionId: id,
        tier: "mellem",
        priceOere: 35000,
        sizeText: "ca. 40 cm",
      },
      { occasionId: id, tier: "stor", priceOere: 50000, sizeText: "ca. 50 cm" },
    ]);
    await db.transaction(async (tx) => {
      // After the first update, lille (40000) is above mellem (35000) for a
      // moment. Only the final prices are checked.
      for (const [tier, price] of [
        ["lille", 40000],
        ["mellem", 50000],
        ["stor", 65000],
      ] as const) {
        await tx
          .update(occasionTiers)
          .set({ priceOere: price })
          .where(
            sql`${occasionTiers.occasionId} = ${id} and ${occasionTiers.tier} = ${tier}`,
          );
      }
    });
    const rows = await db
      .select({ tier: occasionTiers.tier, price: occasionTiers.priceOere })
      .from(occasionTiers)
      .where(eq(occasionTiers.occasionId, id))
      .orderBy(occasionTiers.tier);
    expect(rows.map((r) => r.price)).toEqual([40000, 50000, 65000]);
  });

  it("removes tiers with their occasion", async () => {
    const id = await newOccasion();
    await db
      .insert(occasionTiers)
      .values({
        occasionId: id,
        tier: "lille",
        priceOere: 25000,
        sizeText: "ca. 30 cm",
      });
    await db.delete(occasions).where(eq(occasions.id, id));
    expect(await db.select().from(occasionTiers)).toHaveLength(0);
  });
});

describe("occasions", () => {
  it("refuses an address with spaces or capitals", async () => {
    const code = await pgErrorCode(
      db.insert(occasions).values({ slug: "Bare Fordi", name: "Bare fordi" }),
    );
    expect(code).toBe(PG.checkViolation);
  });
});

describe("shop settings", () => {
  it("holds exactly one row", async () => {
    await db.insert(shopSettings).values(settings);
    expect(await pgErrorCode(db.insert(shopSettings).values(settings))).toBe(
      PG.uniqueViolation,
    );
    expect(
      await pgErrorCode(db.insert(shopSettings).values({ ...settings, id: 2 })),
    ).toBe(PG.checkViolation);
  });

  it("refuses weekdays outside 1 to 7, and an empty list", async () => {
    for (const deliveryWeekdays of [[0, 1], [8], []]) {
      expect(
        await pgErrorCode(
          db.insert(shopSettings).values({ ...settings, deliveryWeekdays }),
        ),
      ).toBe(PG.checkViolation);
    }
  });
});

describe("delivery postcodes", () => {
  it("refuses anything but four digits", async () => {
    expect(
      await pgErrorCode(
        db.insert(deliveryPostcodes).values({ postcode: "43a0", town: "X" }),
      ),
    ).toBe(PG.checkViolation);
  });
});

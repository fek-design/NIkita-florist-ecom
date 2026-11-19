// Spec: "Placeholder data is marked" (seeded data, seeding twice).
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import {
  deliveryPostcodes,
  occasions,
  occasionTiers,
  shopSettings,
} from "./schema.js";
import { seed, seedOccasions, seedPostcodes } from "./seed.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());
beforeEach(() => resetCatalog(db));

describe("seed", () => {
  it("creates the placeholder catalogue, all marked as placeholders", async () => {
    await seed(db);
    const allOccasions = await db.select().from(occasions);
    const tiers = await db.select().from(occasionTiers);
    const postcodes = await db.select().from(deliveryPostcodes);
    const settings = await db.select().from(shopSettings);

    expect(allOccasions).toHaveLength(seedOccasions.length);
    expect(tiers).toHaveLength(seedOccasions.length * 3);
    expect(postcodes).toHaveLength(seedPostcodes.length);
    expect(settings).toHaveLength(1);

    for (const row of [...allOccasions, ...tiers, ...postcodes, ...settings]) {
      expect(row.isPlaceholder).toBe(true);
    }
    expect(settings[0]).toMatchObject({
      deliveryFeeOere: 8000,
      sameDayCutoff: "12:00:00",
      deliveryWeekdays: [1, 2, 3, 4, 5, 6],
      dailyCapacity: 15,
      pickupEnabled: true,
    });
  });

  it("does not duplicate rows or overwrite confirmed ones when run again", async () => {
    await seed(db);

    // The owner confirms Fødselsdag's small bouquet at a new price.
    const [birthday] = await db
      .select({ id: occasions.id })
      .from(occasions)
      .where(eq(occasions.slug, "fodselsdag"));
    const lille = and(
      eq(occasionTiers.occasionId, birthday!.id),
      eq(occasionTiers.tier, "lille"),
    );
    await db
      .update(occasionTiers)
      .set({ priceOere: 27500, isPlaceholder: false })
      .where(lille);

    await seed(db);

    expect(await db.select().from(occasions)).toHaveLength(
      seedOccasions.length,
    );
    expect(await db.select().from(occasionTiers)).toHaveLength(
      seedOccasions.length * 3,
    );
    expect(await db.select().from(deliveryPostcodes)).toHaveLength(
      seedPostcodes.length,
    );
    expect(await db.select().from(shopSettings)).toHaveLength(1);
    const [confirmed] = await db.select().from(occasionTiers).where(lille);
    expect(confirmed).toMatchObject({ priceOere: 27500, isPlaceholder: false });
  });
});

// Spec: "Only visible occasions reach customers", "Photos belong to
// occasions", "Delivery rules come from settings", "Postcode check".
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { seed } from "../db/seed.js";
import {
  closedDates,
  occasionPhotos,
  occasions,
  occasionTiers,
} from "../db/schema.js";
import {
  checkPostcode,
  getDeliveryRules,
  getOccasion,
  listOccasions,
} from "./queries.js";

const { client, db } = connectTestDatabase();
afterAll(() => client.end());
beforeEach(async () => {
  await resetCatalog(db);
  await seed(db);
});

async function occasionId(slug: string) {
  const [row] = await db
    .select({ id: occasions.id })
    .from(occasions)
    .where(eq(occasions.slug, slug));
  return row!.id;
}

describe("listOccasions", () => {
  it("lists the seeded occasions in sort order with the lowest price", async () => {
    const list = await listOccasions(db);
    expect(list.map((o) => o.slug)).toEqual([
      "jul-og-advent",
      "fodselsdag",
      "bisaettelse",
      "bare-fordi",
      "kaerlighed",
      "tak",
    ]);
    expect(list[2]).toMatchObject({
      name: "Bisættelse",
      fromPriceOere: 30000,
      soldOut: false,
      placeholder: true,
      mainPhoto: null,
    });
  });

  it("leaves out hidden occasions", async () => {
    await db
      .update(occasions)
      .set({ isVisible: false })
      .where(eq(occasions.slug, "tak"));
    expect((await listOccasions(db)).map((o) => o.slug)).not.toContain("tak");
  });

  it("keeps sold-out occasions, marked as sold out", async () => {
    await db
      .update(occasions)
      .set({ isSoldOut: true })
      .where(eq(occasions.slug, "tak"));
    const tak = (await listOccasions(db)).find((o) => o.slug === "tak");
    expect(tak?.soldOut).toBe(true);
  });

  it("leaves out occasions without all three tiers", async () => {
    const id = await occasionId("tak");
    await db
      .delete(occasionTiers)
      .where(
        and(eq(occasionTiers.occasionId, id), eq(occasionTiers.tier, "stor")),
      );
    expect((await listOccasions(db)).map((o) => o.slug)).not.toContain("tak");
  });

  it("uses the first main photo, ignoring other roles", async () => {
    const id = await occasionId("fodselsdag");
    await db.insert(occasionPhotos).values([
      { occasionId: id, url: "/detail.jpg", alt: "Detalje", role: "detail" },
      {
        occasionId: id,
        url: "/main-2.jpg",
        alt: "Buket 2",
        role: "main",
        sortOrder: 2,
      },
      {
        occasionId: id,
        url: "/main-1.jpg",
        alt: "Buket 1",
        role: "main",
        sortOrder: 1,
      },
    ]);
    const birthday = (await listOccasions(db)).find(
      (o) => o.slug === "fodselsdag",
    );
    expect(birthday?.mainPhoto).toEqual({ url: "/main-1.jpg", alt: "Buket 1" });
  });
});

describe("getOccasion", () => {
  it("returns the three tiers from lille to stor", async () => {
    const occasion = await getOccasion(db, "bisaettelse");
    expect(occasion?.tiers.map((t) => [t.tier, t.priceOere])).toEqual([
      ["lille", 30000],
      ["mellem", 40000],
      ["stor", 55000],
    ]);
    expect(occasion?.photos).toEqual([]);
  });

  it("returns photos main first, then scale, then detail", async () => {
    const id = await occasionId("fodselsdag");
    await db.insert(occasionPhotos).values([
      { occasionId: id, url: "/d.jpg", alt: "Detalje", role: "detail" },
      { occasionId: id, url: "/s.jpg", alt: "I hånden", role: "scale" },
      { occasionId: id, url: "/m.jpg", alt: "Buket", role: "main" },
    ]);
    const occasion = await getOccasion(db, "fodselsdag");
    expect(occasion?.photos.map((p) => p.role)).toEqual([
      "main",
      "scale",
      "detail",
    ]);
  });

  it("returns null for hidden, incomplete and unknown occasions", async () => {
    await db
      .update(occasions)
      .set({ isVisible: false })
      .where(eq(occasions.slug, "tak"));
    const id = await occasionId("kaerlighed");
    await db
      .delete(occasionTiers)
      .where(
        and(eq(occasionTiers.occasionId, id), eq(occasionTiers.tier, "lille")),
      );
    expect(await getOccasion(db, "tak")).toBeNull();
    expect(await getOccasion(db, "kaerlighed")).toBeNull();
    expect(await getOccasion(db, "findes-ikke")).toBeNull();
  });
});

describe("getDeliveryRules", () => {
  it("returns the settings and only closed dates from today on", async () => {
    await db.insert(closedDates).values([
      { date: "2026-11-18", reason: "Før i dag" },
      { date: "2026-11-19", reason: "I dag" },
      { date: "2026-12-24", reason: "Juleaften" },
    ]);
    const rules = await getDeliveryRules(db, "2026-11-19");
    expect(rules).toEqual({
      deliveryFeeOere: 8000,
      sameDayCutoff: "12:00",
      deliveryWeekdays: [1, 2, 3, 4, 5, 6],
      closedDates: [
        { date: "2026-11-19", reason: "I dag" },
        { date: "2026-12-24", reason: "Juleaften" },
      ],
      pickupEnabled: true,
      openingHours: {
        mon: ["10:00", "17:00"],
        tue: ["10:00", "17:00"],
        wed: ["10:00", "17:00"],
        thu: ["10:00", "17:00"],
        fri: ["10:00", "17:00"],
        sat: ["10:00", "14:00"],
      },
      placeholder: true,
    });
  });
});

describe("checkPostcode", () => {
  it("delivers to 4300 for 80 kr. and offers pickup too", async () => {
    expect(await checkPostcode(db, "4300")).toEqual({
      postcode: "4300",
      inZone: true,
      town: "Holbæk",
      feeOere: 8000,
      pickupOffered: true,
    });
  });

  it("offers pickup outside the zone", async () => {
    expect(await checkPostcode(db, "8000")).toEqual({
      postcode: "8000",
      inZone: false,
      town: null,
      feeOere: null,
      pickupOffered: true,
    });
  });
});

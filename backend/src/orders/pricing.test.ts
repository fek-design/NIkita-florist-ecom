import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import {
  deliveryPostcodes,
  occasions,
  occasionTiers,
  shopSettings,
} from "../db/schema.js";
import {
  loadPricingCatalog,
  priceOrder,
  type PricingCatalog,
  type PricingRequest,
} from "./pricing.js";

// Catalogue as seeded: Bisættelse 300/400/550 kr., delivery 80 kr. to 4300.
const catalog: PricingCatalog = {
  occasions: new Map([
    [
      1,
      {
        name: "Bisættelse",
        isVisible: true,
        isSoldOut: false,
        prices: { lille: 30000, mellem: 40000, stor: 55000 },
      },
    ],
    [
      2,
      {
        name: "Tak",
        isVisible: true,
        isSoldOut: true,
        prices: { lille: 25000, mellem: 35000, stor: 50000 },
      },
    ],
    [
      3,
      {
        name: "Skjult",
        isVisible: false,
        isSoldOut: false,
        prices: { lille: 20000 },
      },
    ],
  ]),
  deliveryFeeOere: 8000,
  zone: new Set(["4300"]),
  pickupEnabled: true,
};

const delivery = (
  items: PricingRequest["items"],
  postcode = "4300",
): PricingRequest => ({ items, fulfilment: "delivery", postcode });

describe("priceOrder", () => {
  it("prices Bisættelse Mellem with delivery at 480 kr.", () => {
    const result = priceOrder(
      delivery([{ occasionId: 1, tier: "mellem", quantity: 1 }]),
      catalog,
    );
    expect(result).toMatchObject({
      ok: true,
      deliveryFeeOere: 8000,
      totalOere: 48000,
    });
  });

  it("ignores a price sent by the browser", () => {
    const tampered = {
      occasionId: 1,
      tier: "mellem" as const,
      quantity: 1,
      unitPriceOere: 100,
      priceOere: 100,
    };
    const result = priceOrder(
      { ...delivery([tampered]), totalOere: 100 } as PricingRequest,
      catalog,
    );
    expect(result.ok && result.lines[0]!.unitPriceOere).toBe(40000);
    expect(result.ok && result.totalOere).toBe(48000);
  });

  it("charges one delivery fee per order, whatever the quantity", () => {
    const result = priceOrder(
      delivery([
        { occasionId: 1, tier: "lille", quantity: 2 },
        { occasionId: 1, tier: "stor", quantity: 1 },
      ]),
      catalog,
    );
    expect(result.ok && result.totalOere).toBe(2 * 30000 + 55000 + 8000);
  });

  it("charges no fee for pickup", () => {
    const result = priceOrder(
      {
        items: [{ occasionId: 1, tier: "mellem", quantity: 1 }],
        fulfilment: "pickup",
      },
      catalog,
    );
    expect(result).toMatchObject({
      ok: true,
      deliveryFeeOere: 0,
      totalOere: 40000,
    });
  });

  it("refuses a postcode outside the zone", () => {
    const result = priceOrder(
      delivery([{ occasionId: 1, tier: "mellem", quantity: 1 }], "8000"),
      catalog,
    );
    expect(result).toEqual({
      ok: false,
      problems: [{ code: "outside_zone", postcode: "8000" }],
    });
  });

  it("refuses sold-out, hidden and unknown occasions", () => {
    const result = priceOrder(
      delivery([
        { occasionId: 2, tier: "lille", quantity: 1 },
        { occasionId: 3, tier: "lille", quantity: 1 },
        { occasionId: 99, tier: "lille", quantity: 1 },
      ]),
      catalog,
    );
    expect(result.ok).toBe(false);
    expect(!result.ok && result.problems.map((p) => p.code)).toEqual([
      "sold_out",
      "unknown_occasion",
      "unknown_occasion",
    ]);
  });

  it("refuses zero, fractional and too large quantities", () => {
    const result = priceOrder(
      delivery([
        { occasionId: 1, tier: "lille", quantity: 0 },
        { occasionId: 1, tier: "lille", quantity: 1.5 },
        { occasionId: 1, tier: "lille", quantity: 11 },
      ]),
      catalog,
    );
    expect(!result.ok && result.problems.map((p) => p.code)).toEqual([
      "bad_quantity",
      "bad_quantity",
      "bad_quantity",
    ]);
  });

  it("refuses an empty order and a card message over 200 characters", () => {
    expect(priceOrder(delivery([]), catalog)).toEqual({
      ok: false,
      problems: [{ code: "empty" }],
    });
    const long = priceOrder(
      delivery([
        {
          occasionId: 1,
          tier: "lille",
          quantity: 1,
          cardMessage: "x".repeat(201),
        },
      ]),
      catalog,
    );
    expect(!long.ok && long.problems[0]!.code).toBe("card_message_too_long");
  });

  it("refuses pickup when the shop has turned it off", () => {
    const result = priceOrder(
      {
        items: [{ occasionId: 1, tier: "lille", quantity: 1 }],
        fulfilment: "pickup",
      },
      { ...catalog, pickupEnabled: false },
    );
    expect(!result.ok && result.problems[0]!.code).toBe("pickup_off");
  });
});

describe("loadPricingCatalog", () => {
  const { client, db } = connectTestDatabase();
  afterAll(() => client.end());
  beforeEach(() => resetCatalog(db));

  it("prices an order from the database", async () => {
    await db.insert(shopSettings).values({
      deliveryFeeOere: 8000,
      sameDayCutoff: "12:00",
      deliveryWeekdays: [1, 2, 3, 4, 5, 6],
      dailyCapacity: 15,
    });
    await db
      .insert(deliveryPostcodes)
      .values({ postcode: "4300", town: "Holbæk" });
    const [occasion] = await db
      .insert(occasions)
      .values({ slug: "bisaettelse", name: "Bisættelse" })
      .returning();
    await db.insert(occasionTiers).values(
      (
        [
          ["lille", 30000],
          ["mellem", 40000],
          ["stor", 55000],
        ] as const
      ).map(([tier, priceOere]) => ({
        occasionId: occasion!.id,
        tier,
        priceOere,
        sizeText: "ca.",
      })),
    );

    const request = delivery([
      { occasionId: occasion!.id, tier: "mellem", quantity: 1 },
    ]);
    const loaded = await loadPricingCatalog(db, request);
    expect(loaded).not.toBeNull();
    expect(priceOrder(request, loaded!)).toMatchObject({
      ok: true,
      totalOere: 48000,
    });
  });
});

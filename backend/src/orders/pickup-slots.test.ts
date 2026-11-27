import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../build-app.js";
import { connectTestDatabase } from "../test/test-database.js";
import { resetCatalog } from "../test/reset.js";
import { seed } from "../db/seed.js";
import { closedDates, occasions, shopSettings } from "../db/schema.js";
import { placeOrder } from "./capacity.js";
import { pickupSlots, type SlotInput } from "./pickup-slots.js";

const weekdays = {
  mon: ["10:00", "17:00"],
  tue: ["10:00", "17:00"],
  sat: ["10:00", "14:00"],
} satisfies SlotInput["openingHours"];

const base: SlotInput = {
  date: "2026-11-24", // a Tuesday
  today: "2026-11-23",
  nowHour: 10,
  openingHours: weekdays,
  closed: false,
  pickupEnabled: true,
  perSlot: 4,
  takenBySlot: new Map(),
};

describe("pickupSlots", () => {
  it("gives seven one-hour slots for 10–17", () => {
    const slots = pickupSlots(base);
    expect(slots.map((s) => s.label)).toEqual([
      "10–11",
      "11–12",
      "12–13",
      "13–14",
      "14–15",
      "15–16",
      "16–17",
    ]);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("marks a slot full when its places are taken", () => {
    const slots = pickupSlots({ ...base, takenBySlot: new Map([[12, 4]]) });
    expect(slots.find((s) => s.hour === 12)!.available).toBe(false);
    expect(slots.find((s) => s.hour === 13)!.available).toBe(true);
  });

  it("today starts after the current hour", () => {
    const slots = pickupSlots({ ...base, date: "2026-11-23", nowHour: 11 });
    expect(slots[0]!.label).toBe("12–13");
  });

  it("leaves out a part hour at closing time", () => {
    const slots = pickupSlots({
      ...base,
      openingHours: { tue: ["10:00", "17:30"] },
    });
    expect(slots.at(-1)!.label).toBe("16–17");
  });

  it("has no slots on closed days, past days, days without hours, or with pickup off", () => {
    expect(pickupSlots({ ...base, closed: true })).toEqual([]);
    expect(pickupSlots({ ...base, date: "2026-11-22" })).toEqual([]);
    expect(pickupSlots({ ...base, date: "2026-11-25" })).toEqual([]); // Wednesday not in this table
    expect(pickupSlots({ ...base, pickupEnabled: false })).toEqual([]);
  });
});

describe("GET /pickup/slots", () => {
  const { client, db } = connectTestDatabase();
  afterAll(() => client.end());
  // 10:00 Danish time on Monday 23 Nov 2026.
  const NOW = new Date("2026-11-23T09:00:00Z");
  const app = buildApp({
    getDatabase: () => db,
    now: () => NOW,
    pingDatabase: async () => 1,
  });

  beforeEach(async () => {
    await resetCatalog(db);
    await seed(db);
  });

  it("lists tomorrow's slots from the placeholder hours, uncached, without counts", async () => {
    const res = await app.inject({ url: "/pickup/slots?date=2026-11-24" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toBe("no-store");
    const body = res.json();
    expect(body.placeholder).toBe(true);
    expect(body.slots).toHaveLength(7);
    expect(Object.keys(body.slots[0]).sort()).toEqual([
      "available",
      "hour",
      "label",
    ]);
  });

  it("shows a slot as full once it has as many pickups as allowed", async () => {
    await db.update(shopSettings).set({ pickupsPerSlot: 1 });
    const [occasion] = await db.select().from(occasions).limit(1);
    await placeOrder(
      db,
      {
        token: "t1",
        source: "phone",
        paymentChannel: "at_pickup",
        paymentState: "paid",
        buyerName: "Lise",
        buyerPhone: "40506070",
        fulfilment: "pickup",
        fulfilmentDate: "2026-11-24",
        pickupSlotHour: 12,
        deliveryFeeOere: 0,
        totalOere: 25000,
      },
      [
        {
          lineNo: 1,
          occasionId: occasion!.id,
          occasionName: occasion!.name,
          tier: "lille",
          quantity: 1,
          unitPriceOere: 25000,
          cardMessage: "",
          cardPriceOere: 0,
          wish: "",
        },
      ],
      NOW,
    );
    const res = await app.inject({ url: "/pickup/slots?date=2026-11-24" });
    const slot12 = res
      .json()
      .slots.find((s: { hour: number }) => s.hour === 12);
    expect(slot12.available).toBe(false);
  });

  it("has no slots on a closed day", async () => {
    await db
      .insert(closedDates)
      .values({ date: "2026-11-24", reason: "Lukket" });
    const res = await app.inject({ url: "/pickup/slots?date=2026-11-24" });
    expect(res.json().slots).toEqual([]);
  });

  it("refuses a malformed date", async () => {
    const res = await app.inject({ url: "/pickup/slots?date=tomorrow" });
    expect(res.statusCode).toBe(400);
  });
});

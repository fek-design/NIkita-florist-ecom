// Pickup slots (spec catalog: "Pickup slots", DD-18): one-hour slots within
// the day's opening hours, each available or full. How many places are left
// is never published.
import { and, count, eq, isNotNull } from "drizzle-orm";
import type { Db } from "../catalog/queries.js";
import {
  closedDates,
  orders,
  shopSettings,
  type Weekday,
} from "../db/schema.js";
import { danishDate, danishHour, weekdayKey } from "../lib/danish-time.js";
import { counting } from "./capacity.js";

export type PickupSlot = { hour: number; label: string; available: boolean };

export type SlotInput = {
  date: string;
  today: string;
  nowHour: number;
  openingHours: Partial<Record<Weekday, [string, string]>>;
  closed: boolean;
  pickupEnabled: boolean;
  perSlot: number;
  takenBySlot: Map<number, number>;
};

/** Whole-hour slots inside opening hours; pure, for testing. */
export function pickupSlots(input: SlotInput): PickupSlot[] {
  if (!input.pickupEnabled || input.closed || input.date < input.today)
    return [];
  const hours = input.openingHours[weekdayKey(input.date)];
  if (!hours) return [];
  const [open, close] = hours.map((t) => {
    const [h, m] = t.split(":").map(Number);
    return h! * 60 + m!;
  }) as [number, number];

  const slots: PickupSlot[] = [];
  const first = Math.ceil(open / 60);
  for (let hour = first; (hour + 1) * 60 <= close; hour++) {
    // Today: only slots that start after the current hour.
    if (input.date === input.today && hour <= input.nowHour) continue;
    slots.push({
      hour,
      label: `${hour}–${hour + 1}`,
      available: (input.takenBySlot.get(hour) ?? 0) < input.perSlot,
    });
  }
  return slots;
}

export async function getPickupSlots(
  db: Db,
  date: string,
  now: Date = new Date(),
): Promise<{ slots: PickupSlot[]; placeholder: boolean } | null> {
  const [settings] = await db.select().from(shopSettings);
  if (!settings) return null;
  const [closed] = await db
    .select({ date: closedDates.date })
    .from(closedDates)
    .where(eq(closedDates.date, date));
  const taken = await db
    .select({ hour: orders.pickupSlotHour, n: count() })
    .from(orders)
    .where(
      and(
        eq(orders.fulfilmentDate, date),
        isNotNull(orders.pickupSlotHour),
        counting(now),
      ),
    )
    .groupBy(orders.pickupSlotHour);

  return {
    slots: pickupSlots({
      date,
      today: danishDate(now),
      nowHour: danishHour(now),
      openingHours: settings.openingHours,
      closed: Boolean(closed),
      pickupEnabled: settings.pickupEnabled,
      perSlot: settings.pickupsPerSlot,
      takenBySlot: new Map(taken.map((t) => [t.hour!, t.n])),
    }),
    placeholder: settings.isPlaceholder,
  };
}

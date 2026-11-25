// Which dates a customer can choose (spec catalog: "Available delivery
// dates"). One implementation for the storefront's date buttons and for
// checkout's check, so the two can never disagree.
import { asc, gte } from "drizzle-orm";
import { closedDates, shopSettings } from "../db/schema.js";
import { danishDate, SHOP_TIME_ZONE } from "../lib/danish-time.js";
import type { Db } from "./queries.js";

export const DATE_WINDOW_DAYS = 60;

export type DateRules = {
  /** Latest order time for today, "HH:MM" in Danish time. */
  cutoff: string;
  /** ISO weekdays with delivery and pickup: 1 = Monday ... 7 = Sunday. */
  weekdays: number[];
  /** Closed dates, YYYY-MM-DD. */
  closed: Set<string>;
};

/** "HH:MM" in Danish time. */
export function danishTimeOfDay(now: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

/** YYYY-MM-DD plus `days`, as a calendar date (no time zone involved). */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** ISO weekday of a YYYY-MM-DD date: 1 = Monday ... 7 = Sunday. */
export function isoWeekday(date: string): number {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/** The dates offered from now, in order. Pure: pass the clock in. */
export function availableDates(rules: DateRules, now: Date): string[] {
  const today = danishDate(now);
  const beforeCutoff = danishTimeOfDay(now) < rules.cutoff.slice(0, 5);
  const dates: string[] = [];
  for (let i = 0; i <= DATE_WINDOW_DAYS; i++) {
    const date = addDays(today, i);
    if (i === 0 && !beforeCutoff) continue;
    if (!rules.weekdays.includes(isoWeekday(date))) continue;
    if (rules.closed.has(date)) continue;
    dates.push(date);
  }
  return dates;
}

/** Whether one date can be chosen now: the check checkout uses. */
export function isAvailableDate(
  date: string,
  rules: DateRules,
  now: Date,
): boolean {
  return availableDates(rules, now).includes(date);
}

/** Reads the rules from the database. */
export async function loadDateRules(
  db: Db,
  now: Date,
): Promise<DateRules | null> {
  const [settings] = await db
    .select({
      cutoff: shopSettings.sameDayCutoff,
      weekdays: shopSettings.deliveryWeekdays,
    })
    .from(shopSettings);
  if (!settings) return null;
  const closed = await db
    .select({ date: closedDates.date })
    .from(closedDates)
    .where(gte(closedDates.date, danishDate(now)))
    .orderBy(asc(closedDates.date));
  return {
    cutoff: settings.cutoff,
    weekdays: settings.weekdays,
    closed: new Set(closed.map((c) => c.date)),
  };
}

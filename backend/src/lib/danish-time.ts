/**
 * The shop runs on Danish time, but servers (Vercel) run on UTC. Dates and
 * times customers see are always computed in Europe/Copenhagen.
 */
export const SHOP_TIME_ZONE = "Europe/Copenhagen";

/** Today's date in Denmark as YYYY-MM-DD. */
export function danishDate(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "12:00:00" from Postgres becomes "12:00". */
export function hoursAndMinutes(time: string): string {
  return time.slice(0, 5);
}

/** The current hour (0–23) in Denmark. */
export function danishHour(now: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return Number(hour);
}

/** Weekday key of a YYYY-MM-DD date, as used in the opening hours. */
export function weekdayKey(
  date: string,
): "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" {
  const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  return keys[new Date(`${date}T12:00:00Z`).getUTCDay()]!;
}

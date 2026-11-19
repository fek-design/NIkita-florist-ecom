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

// Dates as customers read them, always in Danish time.
const ZONE = "Europe/Copenhagen";

/** Today in Denmark as YYYY-MM-DD. */
export function danishToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "tir. 24. nov." */
export function shortDate(date: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

/** "tirsdag 24. november" */
export function longDate(date: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

const DAYS = [
  "",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
];

/** [1,2,3,4,5,6] → "mandag til lørdag"; gaps are listed: "mandag, onsdag og fredag". */
export function weekdaysInWords(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  const consecutive = sorted.every(
    (d, i) => i === 0 || d === sorted[i - 1]! + 1,
  );
  if (sorted.length > 2 && consecutive) {
    return `${DAYS[sorted[0]!]} til ${DAYS[sorted.at(-1)!]}`;
  }
  const names = sorted.map((d) => DAYS[d]!);
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} og ${names.at(-1)}`
    : (names[0] ?? "");
}

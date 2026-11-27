// Opening hours in plain Danish, consecutive days with the same hours joined:
// "mandag–fredag 10–17, lørdag 10–14".
import type { DeliveryRules, Weekday } from "@/lib/catalog";

const DAYS: [Weekday, string][] = [
  ["mon", "mandag"],
  ["tue", "tirsdag"],
  ["wed", "onsdag"],
  ["thu", "torsdag"],
  ["fri", "fredag"],
  ["sat", "lørdag"],
  ["sun", "søndag"],
];

/** "10:00" → "10", "09:30" → "9.30" */
function time(t: string): string {
  const [h, m] = t.split(":");
  return m === "00" ? String(Number(h)) : `${Number(h)}.${m}`;
}

export function openingHoursInWords(
  hours: DeliveryRules["openingHours"],
): string {
  const groups: { first: string; last: string; hours: string }[] = [];
  let previousOpen = false;
  for (const [key, name] of DAYS) {
    const h = hours[key];
    if (!h) {
      previousOpen = false;
      continue;
    }
    const text = `${time(h[0])}–${time(h[1])}`;
    const last = groups.at(-1);
    if (previousOpen && last && last.hours === text) last.last = name;
    else groups.push({ first: name, last: name, hours: text });
    previousOpen = true;
  }
  return groups
    .map((g) =>
      g.first === g.last
        ? `${g.first} ${g.hours}`
        : `${g.first}–${g.last} ${g.hours}`,
    )
    .join(", ");
}

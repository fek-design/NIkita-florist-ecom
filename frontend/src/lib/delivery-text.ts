// The delivery or pickup in the customer's words, the same on every page.
import type { CartDelivery } from "@/lib/cart-store";
import { longDate } from "@/lib/dates";

export function slotLabel(hour: number): string {
  return `kl. ${hour}–${hour + 1}`;
}

/** "Levering til 4300 Holbæk" / "Afhentning i butikken kl. 14–15" */
export function deliveryWhere(d: CartDelivery): string {
  return d.fulfilment === "delivery"
    ? `Levering til ${d.postcode} ${d.town}`
    : `Afhentning i butikken ${slotLabel(d.pickupSlotHour)}`;
}

/** "Tirsdag 24. november" */
export function deliveryDay(d: CartDelivery): string {
  const day = longDate(d.date);
  return day.charAt(0).toUpperCase() + day.slice(1);
}

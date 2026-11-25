// The cart lives in the browser (spec storefront: "Cart kept across
// visits"). One delivery or pickup per order (defaults confirmed 19 Nov),
// so the cart holds one delivery choice and any number of bouquets.
import type { Tier } from "@/lib/catalog";

const KEY = "nn-kurv";
const listeners = new Set<() => void>();

export type CartDelivery =
  | {
      fulfilment: "delivery";
      postcode: string;
      town: string;
      feeOere: number;
      date: string;
    }
  | {
      fulfilment: "pickup";
      date: string;
      pickupSlotHour: number;
    };

export type CartLine = {
  slug: string;
  name: string;
  tier: Tier;
  quantity: number;
  /** For showing only: checkout recalculates every price on the server. */
  unitPriceOere: number;
  cardMessage: string;
};

export type Cart = { delivery: CartDelivery | null; lines: CartLine[] };

const EMPTY: Cart = { delivery: null, lines: [] };
let cached: { raw: string | null; cart: Cart } = { raw: null, cart: EMPTY };

/** The cart, or an empty one. The same object until it changes. */
export function getCart(): Cart {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cached.raw) return cached.cart;
    const cart = raw ? (JSON.parse(raw) as Cart) : EMPTY;
    cached = { raw, cart: Array.isArray(cart.lines) ? cart : EMPTY };
    return cached.cart;
  } catch {
    return EMPTY;
  }
}

export function getServerCart(): Cart {
  return EMPTY;
}

function save(cart: Cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    // Private browsing or full storage: the cart lasts for this page only.
  }
  listeners.forEach((l) => l());
}

export function cartCount(): number {
  return getCart().lines.reduce((sum, l) => sum + (l.quantity || 0), 0);
}

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function sameDelivery(a: CartDelivery, b: CartDelivery): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Adds a bouquet. If the cart already holds bouquets for another delivery,
 * nothing changes and "conflict" comes back, so the page can ask first.
 */
export function addToCart(
  line: CartLine,
  delivery: CartDelivery,
): "added" | "conflict" {
  const cart = getCart();
  if (
    cart.lines.length > 0 &&
    cart.delivery &&
    !sameDelivery(cart.delivery, delivery)
  ) {
    return "conflict";
  }
  save({ delivery, lines: [...cart.lines, line] });
  return "added";
}

/** After the customer agreed: the whole cart moves to the new delivery. */
export function addMovingDelivery(line: CartLine, delivery: CartDelivery) {
  save({ delivery, lines: [...getCart().lines, line] });
}

export function notifyCartChanged() {
  listeners.forEach((l) => l());
}

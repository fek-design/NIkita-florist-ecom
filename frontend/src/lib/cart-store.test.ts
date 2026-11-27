import { beforeEach, describe, expect, it } from "vitest";
import {
  addToCart,
  cartTotals,
  clearCart,
  getCart,
  removeLine,
  setQuantity,
  type CartDelivery,
  type CartLine,
} from "./cart-store";

// A stand-in for the browser's localStorage, switchable to "full" to test
// the fallback when storage fails.
const store = new Map<string, string>();
let failing = false;
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    if (failing) throw new Error("QuotaExceededError");
    store.set(k, v);
  },
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

const line = (overrides: Partial<CartLine> = {}): CartLine => ({
  slug: "bisaettelse",
  name: "Bisættelse",
  tier: "mellem",
  quantity: 1,
  unitPriceOere: 35000,
  cardMessage: "",
  ...overrides,
});
const delivery: CartDelivery = {
  fulfilment: "delivery",
  postcode: "4300",
  town: "Holbæk",
  feeOere: 8000,
  date: "2026-12-01",
};
const pickup: CartDelivery = {
  fulfilment: "pickup",
  date: "2026-12-01",
  pickupSlotHour: 14,
};

beforeEach(() => {
  store.clear();
  failing = false;
});

describe("cart store", () => {
  it("adds a bouquet with one delivery and totals 350 + 80 = 430 kr.", () => {
    expect(addToCart(line(), delivery)).toBe("added");
    expect(cartTotals(getCart())).toEqual({
      bouquetsOere: 35000,
      feeOere: 8000,
      totalOere: 43000,
    });
  });

  it("counts a 20 kr. card per bouquet, times its quantity", () => {
    addToCart(
      line({ quantity: 2, cardMessage: "Kh.", cardPriceOere: 2000 }),
      delivery,
    );
    // 2 × (350 + 20) + 80
    expect(cartTotals(getCart()).totalOere).toBe(2 * 37000 + 8000);
  });

  it("charges no fee for a pickup", () => {
    addToCart(line(), pickup);
    expect(cartTotals(getCart()).totalOere).toBe(35000);
  });

  it("refuses a second delivery without asking", () => {
    addToCart(line(), delivery);
    expect(addToCart(line(), pickup)).toBe("conflict");
    expect(getCart().lines).toHaveLength(1);
  });

  it("keeps the quantity within 1 to 10", () => {
    addToCart(line(), delivery);
    setQuantity(0, 12);
    expect(getCart().lines[0]!.quantity).toBe(10);
    setQuantity(0, 0);
    expect(getCart().lines[0]!.quantity).toBe(1);
  });

  it("forgets the delivery when the last line is removed", () => {
    addToCart(line(), delivery);
    removeLine(0);
    expect(getCart()).toEqual({ delivery: null, lines: [] });
  });

  it("empties after a paid order", () => {
    addToCart(line(), delivery);
    clearCart();
    expect(getCart().lines).toHaveLength(0);
  });

  it("does not throw when storage fails", () => {
    failing = true;
    expect(() => addToCart(line(), delivery)).not.toThrow();
  });

  it("reads a damaged cart as empty", () => {
    store.set("nn-kurv", "{not json");
    expect(getCart()).toEqual({ delivery: null, lines: [] });
  });
});

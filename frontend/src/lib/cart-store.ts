// The cart lives in the browser (spec storefront: "Cart kept across
// visits"). Task 5.x adds lines; the navbar only needs the count now.
const KEY = "nn-kurv";
const listeners = new Set<() => void>();

type StoredCart = { lines: { quantity: number }[] };

function read(): StoredCart {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredCart) : { lines: [] };
  } catch {
    return { lines: [] };
  }
}

export function cartCount(): number {
  return read().lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
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

/** Called by the cart after it changes, so the badge updates at once. */
export function notifyCartChanged() {
  listeners.forEach((l) => l());
}

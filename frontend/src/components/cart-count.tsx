"use client";

import { useSyncExternalStore } from "react";
import { cartCount, subscribeToCart } from "@/lib/cart-store";

/** The number on the basket; hidden when the cart is empty. */
export function CartCount() {
  const count = useSyncExternalStore(subscribeToCart, cartCount, () => 0);
  if (count === 0) return null;
  return (
    <span className="cart-badge" aria-hidden="true">
      {count}
    </span>
  );
}

/** Screen-reader label for the basket link, kept in step with the count. */
export function CartLabel() {
  const count = useSyncExternalStore(subscribeToCart, cartCount, () => 0);
  return (
    <span className="visually-hidden">
      Kurv, {count === 1 ? "1 buket" : `${count} buketter`}
    </span>
  );
}

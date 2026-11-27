import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Din kurv · Nikita Nielsen",
  robots: { index: false },
};

/** The cart (hi-fi S6). It lives in the browser, so the page is client-side. */
export default function CartPage() {
  return <CartView />;
}

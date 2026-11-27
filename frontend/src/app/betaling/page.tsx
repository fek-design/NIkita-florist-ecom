import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Betaling · Nikita Nielsen",
  robots: { index: false },
};

/** Checkout (hi-fi S7). "?annulleret=1" comes back from a cancelled payment. */
export default function CheckoutPage({ searchParams }: PageProps<"/betaling">) {
  return (
    <Suspense fallback={null}>
      {searchParams.then((sp) => (
        <CheckoutForm cancelled={sp.annulleret === "1"} />
      ))}
    </Suspense>
  );
}

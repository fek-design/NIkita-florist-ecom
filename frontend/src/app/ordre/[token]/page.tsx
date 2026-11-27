import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/order-confirmation";

export const metadata: Metadata = {
  title: "Tak for din bestilling · Nikita Nielsen",
  robots: { index: false },
};

/** Confirmation (hi-fi S8). The token in the address is the only key. */
export default function OrderPage({ params }: PageProps<"/ordre/[token]">) {
  return (
    <Suspense fallback={null}>
      {params.then(({ token }) => (
        <OrderConfirmation token={token} />
      ))}
    </Suspense>
  );
}

"use client";

// Confirmation (hi-fi S8, spec checkout): shows the order as paid only once
// the payment provider has confirmed it (the webhook), and a waiting message
// until then. Asks again every two seconds for up to a minute.
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/icons";
import { clearCart, getCart } from "@/lib/cart-store";
import { longDate } from "@/lib/dates";
import { kroner } from "@/lib/format";
import { SHOP } from "@/lib/shop";
import { TIER_NAME } from "@/lib/use-cart";
import form from "./order-form.module.css";
import styles from "./order-confirmation.module.css";

type Order = {
  number: number;
  paymentState: "pending" | "paid" | "expired" | "failed" | string;
  fulfilment: "delivery" | "pickup";
  date: string;
  pickupSlot: string | null;
  latestTime: string | null;
  recipient: {
    name: string;
    address: string;
    postcode: string;
    town: string | null;
  } | null;
  notHome: "door" | "neighbour" | "call_buyer" | null;
  lines: {
    name: string;
    tier: "lille" | "mellem" | "stor";
    quantity: number;
    unitPriceOere: number;
    cardMessage: string;
    cardPriceOere: number;
    wish: string;
  }[];
  deliveryFeeOere: number;
  totalOere: number;
  buyerEmail: string;
};

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "order"; order: Order }
  | { kind: "offline" };

const NOT_HOME = {
  door: "Er ingen hjemme, stiller vi den ved døren.",
  neighbour: "Er ingen hjemme, afleverer vi den hos en nabo.",
  call_buyer: "Er ingen hjemme, ringer vi til dig.",
};

export function OrderConfirmation({ token }: { token: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let current = true;
    const ask = () => {
      fetch(`/api/orders/${encodeURIComponent(token)}`, { cache: "no-store" })
        .then(async (r) => {
          if (!current) return;
          if (r.status === 404 || r.status === 400) {
            setState({ kind: "missing" });
            return;
          }
          if (!r.ok) throw new Error(String(r.status));
          const order = (await r.json()) as Order;
          setState({ kind: "order", order });
          if (order.paymentState === "paid") {
            if (getCart().lines.length > 0) clearCart();
            try {
              sessionStorage.removeItem("nn-betaling");
            } catch {}
          } else if (order.paymentState === "pending" && ++tries < 30) {
            timer = setTimeout(ask, 2000);
          }
        })
        .catch(() => current && setState({ kind: "offline" }));
    };
    ask();
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [token]);

  if (state.kind === "loading") {
    return <div className={styles.page} aria-busy="true" />;
  }
  if (state.kind === "missing") {
    return (
      <div className={styles.page}>
        <h1>Vi kan ikke finde ordren</h1>
        <p>Tjek linket i din bekræftelse, eller ring til os på {SHOP.phone}.</p>
        <Link href="/" className={form.secondary}>
          Tilbage til forsiden
        </Link>
      </div>
    );
  }
  if (state.kind === "offline") {
    return (
      <div className={styles.page}>
        <h1>Siden kan ikke hentes lige nu</h1>
        <p>
          Din betaling er ikke påvirket. Prøv at genindlæse siden, eller tjek
          din e-mail for bekræftelsen.
        </p>
      </div>
    );
  }

  const { order } = state;

  if (order.paymentState === "expired" || order.paymentState === "failed") {
    return (
      <div className={styles.page}>
        <h1>Betalingen blev ikke gennemført</h1>
        <p>Der er ikke trukket penge, og ordren er ikke sendt til Nikita.</p>
        <Link href="/kurv" className={form.primary}>
          Tilbage til kurven
        </Link>
      </div>
    );
  }

  const paid = order.paymentState === "paid";
  const bouquets = order.lines
    .map(
      (l) =>
        `${l.quantity > 1 ? `${l.quantity} × ` : ""}${l.name} · ${TIER_NAME[l.tier]}`,
    )
    .join(", ");
  const day = longDate(order.date);
  const cards = order.lines.filter((l) => l.cardMessage);

  return (
    <div className={styles.page}>
      {paid ? (
        <p className={styles.paid}>
          <CheckIcon /> Betalingen er gennemført
        </p>
      ) : (
        <p className={styles.waiting} role="status">
          Vi venter på bekræftelsen af din betaling. Siden opdaterer sig selv.
        </p>
      )}
      <h1>Tak for din bestilling</h1>
      <p>
        Ordrenummer {order.number}.{" "}
        {paid
          ? `Vi har sendt en bekræftelse til ${order.buyerEmail}.`
          : `Bekræftelsen sendes til ${order.buyerEmail}, når betalingen er på plads.`}
      </p>

      <section className={styles.panel} aria-labelledby="det-sker-nu">
        <h2 id="det-sker-nu">Det sker nu</h2>
        <ol>
          <li>Nikita binder din buket, {bouquets}.</li>
          {order.fulfilment === "delivery" && order.recipient ? (
            <li>
              Den leveres {day} i løbet af dagen
              {order.latestTime
                ? ` (senest kl. ${order.latestTime})`
                : ""} til {order.recipient.name}, {order.recipient.address},{" "}
              {order.recipient.postcode} {order.recipient.town ?? ""}.
              {order.notHome ? ` ${NOT_HOME[order.notHome]}` : ""}
            </li>
          ) : (
            <li>
              Du kan hente den i butikken, {SHOP.street}, {SHOP.town}, {day} kl.{" "}
              {order.pickupSlot}.
            </li>
          )}
          {cards.map((l, i) => (
            <li key={i}>Kortet lyder: “{l.cardMessage}”</li>
          ))}
          {order.lines
            .filter((l) => l.wish)
            .map((l, i) => (
              <li key={`w${i}`}>
                Dit ønske til {l.name}: “{l.wish}”. Nikita følger det, så vidt
                det kan lade sig gøre.
              </li>
            ))}
        </ol>
        <p className={styles.total}>
          {paid ? "Betalt" : "I alt"}: {kroner(order.totalOere)} inkl. moms
        </p>
      </section>

      <p>
        Spørgsmål? Ring til Nikita på <a href={SHOP.phoneHref}>{SHOP.phone}</a>{" "}
        eller skriv til <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>.
      </p>
      <Link href="/" className={form.secondary}>
        Tilbage til forsiden
      </Link>
    </div>
  );
}

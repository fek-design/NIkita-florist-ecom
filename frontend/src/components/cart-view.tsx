"use client";

// The cart (hi-fi S6): bouquets with quantity 1–10 and remove, the one
// delivery or pickup with a way to change it, the fee and the total incl.
// moms (P3), then "Gå til betaling". Prices are checked against the
// catalogue on opening; the server prices the order again at checkout.
import Link from "next/link";
import { Photo } from "@/components/photo";
import {
  cartTotals,
  MAX_QUANTITY,
  removeLine,
  setQuantity,
} from "@/lib/cart-store";
import { deliveryDay, deliveryWhere } from "@/lib/delivery-text";
import { kroner } from "@/lib/format";
import { standInFor } from "@/lib/stand-ins";
import { TIER_NAME, useCart, useRefreshedPrices } from "@/lib/use-cart";
import form from "./order-form.module.css";
import styles from "./cart-view.module.css";

export function CartView() {
  const cart = useCart();
  const notes = useRefreshedPrices(cart);
  const { bouquetsOere, feeOere, totalOere } = cartTotals(cart);
  const delivery = cart.delivery;

  if (cart.lines.length === 0 || !delivery) {
    return (
      <div className={styles.page}>
        <h1>Din kurv</h1>
        {notes.map((n) => (
          <p key={n} className={styles.note} role="status">
            {n}
          </p>
        ))}
        <p>Kurven er tom.</p>
        <Link href="/anledninger" className={form.primary}>
          Se buketterne
        </Link>
      </div>
    );
  }

  const cards = cart.lines.filter((l) => l.cardMessage);

  return (
    <div className={styles.page}>
      <h1>Din kurv</h1>

      {notes.length > 0 && (
        <div className={styles.note} role="status">
          {notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}

      <ul className={styles.lines}>
        {cart.lines.map((line, index) => (
          <li
            key={`${line.slug}-${line.tier}-${index}`}
            className={styles.line}
          >
            {/* Thumbnail and name lead back to the bouquet; the thumbnail
                is a duplicate of the name for screen readers, so hidden. */}
            <Link
              href={`/anledning/${line.slug}`}
              className={styles.thumb}
              tabIndex={-1}
              aria-hidden="true"
            >
              <Photo
                photo={line.photo ?? standInFor(line.slug)}
                ratio={4 / 5}
                sizes="96px"
              />
            </Link>
            <div className={styles.info}>
              <Link href={`/anledning/${line.slug}`} className={styles.name}>
                {line.name} · {TIER_NAME[line.tier]}
              </Link>
              <p>{kroner(line.unitPriceOere * line.quantity)}</p>
              <div className={styles.actions}>
                <div
                  className={styles.stepper}
                  role="group"
                  aria-label={`Antal ${line.name}`}
                >
                  <button
                    type="button"
                    aria-label="Én færre"
                    disabled={line.quantity <= 1}
                    onClick={() => setQuantity(index, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span aria-live="polite">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Én mere"
                    disabled={line.quantity >= MAX_QUANTITY}
                    onClick={() => setQuantity(index, line.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeLine(index)}
                >
                  Fjern
                  <span className="visually-hidden"> {line.name}</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section className={styles.panel} aria-labelledby="levering">
        <div className={styles.panelHead}>
          <h2 id="levering">
            {delivery.fulfilment === "delivery" ? "Levering" : "Afhentning"}
          </h2>
          <Link href={`/anledning/${cart.lines[0]!.slug}`}>
            Ret<span className="visually-hidden"> levering</span>
          </Link>
        </div>
        <p>{deliveryDay(delivery)}</p>
        <p>{deliveryWhere(delivery)}</p>
        {cards.map((l, i) => (
          <p key={i}>
            Kort: “
            {l.cardMessage.length > 40
              ? `${l.cardMessage.slice(0, 40).trimEnd()} …`
              : l.cardMessage}
            ”
          </p>
        ))}
      </section>

      <dl className={styles.totals}>
        <div>
          <dt>Buketter</dt>
          <dd>{kroner(bouquetsOere)}</dd>
        </div>
        <div>
          <dt>
            {delivery.fulfilment === "delivery"
              ? `Levering til ${delivery.postcode}`
              : "Afhentning i butikken"}
          </dt>
          <dd>{feeOere > 0 ? kroner(feeOere) : "Gratis"}</dd>
        </div>
        <div className={styles.sum}>
          <dt>I alt inkl. moms</dt>
          <dd>{kroner(totalOere)}</dd>
        </div>
      </dl>

      <div className={styles.cta}>
        <Link href="/betaling" className={form.primary}>
          Gå til betaling
        </Link>
        <p className="muted">
          Du betaler med MobilePay eller kort. Ingen konto nødvendig.
        </p>
        <Link href="/anledninger" className={styles.more}>
          Se flere buketter
        </Link>
      </div>
    </div>
  );
}

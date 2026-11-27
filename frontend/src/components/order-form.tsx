"use client";

// The choices on the occasion page (hi-fi S4, S4b, S4c, S5): size, delivery
// or pickup, postcode with the fee (P3, DD-14), date (P2), pickup slot
// (DD-18), card message, and "Læg i kurven". Prices shown here are for
// reading only; checkout recalculates everything on the server.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";
import {
  addMovingDelivery,
  addToCart,
  getCart,
  type CartDelivery,
  type CartLine,
} from "@/lib/cart-store";
import type { DeliveryRules, OccasionDetail, Tier } from "@/lib/catalog";
import {
  addDays,
  danishToday,
  longDate,
  shortDate,
  weekdaysInWords,
} from "@/lib/dates";
import { kroner } from "@/lib/format";
import { SHOP } from "@/lib/shop";
import { standInFor } from "@/lib/stand-ins";
import styles from "./order-form.module.css";

const TIER_NAME: Record<Tier, string> = {
  lille: "Lille",
  mellem: "Mellem",
  stor: "Stor",
};
const MAX_CARD = 200;

type Postcode =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok"; postcode: string; town: string; feeOere: number }
  | { state: "outside"; postcode: string }
  | { state: "error" };

type Slot = { hour: number; label: string; available: boolean };

export function OrderForm({
  occasion,
  rules,
}: {
  occasion: OccasionDetail;
  rules: DeliveryRules | null;
}) {
  const [tier, setTier] = useState<Tier>("mellem");
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [postcode, setPostcode] = useState("");
  const [check, setCheck] = useState<Postcode>({ state: "idle" });
  const [dates, setDates] = useState<string[] | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [slotsFor, setSlotsFor] = useState<{
    date: string;
    slots: Slot[];
  } | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [card, setCard] = useState("");
  const [added, setAdded] = useState<CartLine | null>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const pending = useRef<{ line: CartLine; delivery: CartDelivery } | null>(
    null,
  );

  const price = occasion.tiers.find((t) => t.tier === tier);

  // Dates the shop can take, from the shared date rules on the server.
  useEffect(() => {
    fetch("/api/delivery/dates")
      .then((r) => (r.ok ? r.json() : { dates: [] }))
      .then((body: { dates: string[] }) => setDates(body.dates))
      .catch(() => setDates([]));
  }, []);

  // Pickup slots for the chosen day. They are kept with the day they belong
  // to, so a slower answer for an earlier day is never shown for a later one.
  useEffect(() => {
    if (fulfilment !== "pickup" || !date) return;
    let current = true;
    fetch(`/api/pickup/slots?date=${date}`)
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then(
        (body: { slots: Slot[] }) =>
          current && setSlotsFor({ date, slots: body.slots }),
      )
      .catch(() => current && setSlotsFor({ date, slots: [] }));
    return () => {
      current = false;
    };
  }, [fulfilment, date]);
  const slots = slotsFor?.date === date ? slotsFor.slots : null;

  async function checkPostcode(value: string) {
    setPostcode(value);
    if (!/^[0-9]{4}$/.test(value)) {
      setCheck({ state: "idle" });
      return;
    }
    setCheck({ state: "checking" });
    try {
      const res = await fetch(`/api/delivery/postcodes/${value}`);
      const body = (await res.json()) as {
        inZone: boolean;
        town: string | null;
        feeOere: number | null;
      };
      setCheck(
        body.inZone
          ? {
              state: "ok",
              postcode: value,
              town: body.town ?? "",
              feeOere: body.feeOere ?? 0,
            }
          : { state: "outside", postcode: value },
      );
    } catch {
      setCheck({ state: "error" });
    }
  }

  const today = danishToday();
  const tomorrow = addDays(today, 1);
  const quick = [
    { date: today, label: "I dag" },
    { date: tomorrow, label: "I morgen" },
  ].filter((q) => dates?.includes(q.date));
  const otherChosen = date !== null && !quick.some((q) => q.date === date);

  const fee =
    fulfilment === "delivery" && check.state === "ok" ? check.feeOere : 0;
  const missing: string[] = [];
  if (occasion.soldOut) missing.push("Buketten er udsolgt");
  if (fulfilment === "delivery" && check.state !== "ok")
    missing.push("et postnummer, vi leverer til");
  if (!date) missing.push("en dag");
  if (fulfilment === "pickup" && slot === null) missing.push("et tidspunkt");
  const ready = missing.length === 0 && price !== undefined;

  function delivery(): CartDelivery {
    return fulfilment === "delivery" && check.state === "ok"
      ? {
          fulfilment,
          postcode: check.postcode,
          town: check.town,
          feeOere: check.feeOere,
          date: date!,
        }
      : { fulfilment: "pickup", date: date!, pickupSlotHour: slot! };
  }

  function add() {
    if (!ready || !price) return;
    const line: CartLine = {
      slug: occasion.slug,
      name: occasion.name,
      tier,
      quantity: 1,
      unitPriceOere: price.priceOere,
      cardMessage: card.trim(),
      photo:
        occasion.photos.find((p) => p.role === "main") ??
        standInFor(occasion.slug),
    };
    const d = delivery();
    if (addToCart(line, d) === "conflict") {
      pending.current = { line, delivery: d };
      confirmDialog.current?.showModal();
      return;
    }
    showAdded(line);
  }

  function showAdded(line: CartLine) {
    setAdded(line);
    sheet.current?.showModal();
  }

  const cart = added ? getCart() : null;
  const cartTotal = cart
    ? cart.lines.reduce((s, l) => s + l.unitPriceOere * l.quantity, 0) +
      (cart.delivery?.fulfilment === "delivery" ? cart.delivery.feeOere : 0)
    : 0;

  return (
    <div className={styles.form}>
      <fieldset className={styles.group}>
        <legend className={styles.label}>Vælg størrelse</legend>
        <div className={styles.row3} role="radiogroup" aria-label="Størrelse">
          {occasion.tiers.map((t) => (
            <button
              key={t.tier}
              type="button"
              role="radio"
              aria-checked={tier === t.tier}
              className={styles.choice}
              onClick={() => setTier(t.tier)}
            >
              <span className={styles.choiceMain}>
                {TIER_NAME[t.tier]}
                {tier === t.tier && <CheckIcon size={18} />}
              </span>
              <span className={styles.choiceSub}>{kroner(t.priceOere)}</span>
            </button>
          ))}
        </div>
        {price && (
          <p className="muted">
            {TIER_NAME[tier]}: {price.sizeText}
            {price.placeholder && <em> · Eksempel</em>}
          </p>
        )}
      </fieldset>

      <section className={styles.group} aria-labelledby="hvornaar">
        <h2 id="hvornaar" className={styles.heading}>
          Hvornår og hvor?
        </h2>
        <div
          className={styles.row2}
          role="radiogroup"
          aria-label="Levering eller afhentning"
        >
          {(
            [
              ["delivery", "Levering"],
              ["pickup", "Afhent i butikken"],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={fulfilment === value}
              className={styles.choice}
              onClick={() => {
                setFulfilment(value);
                setSlot(null);
              }}
            >
              <span className={styles.choiceMain}>
                {text}
                {fulfilment === value && <CheckIcon size={18} />}
              </span>
            </button>
          ))}
        </div>

        {rules && (
          <p className={`muted ${styles.facts}`}>
            {fulfilment === "delivery"
              ? `Vi leverer i ${SHOP.deliveryArea} ${weekdaysInWords(rules.deliveryWeekdays)} for ${kroner(rules.deliveryFeeOere)}${rules.pickupEnabled ? ` Du kan også hente gratis i butikken i ${SHOP.town}.` : ""}`
              : `Hent gratis i butikken på ${SHOP.street}, ${SHOP.postcode} ${SHOP.town}. Vælg dag og tidspunkt, så er buketten klar, når du kommer.`}
            {rules.placeholder && <em> · Eksempel</em>}
          </p>
        )}

        {fulfilment === "delivery" && (
          <div className={styles.field}>
            <label htmlFor="postnummer" className={styles.label}>
              Postnummer
            </label>
            <input
              id="postnummer"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={4}
              value={postcode}
              aria-invalid={check.state === "outside"}
              aria-describedby="postnummer-svar"
              className={`${styles.input} ${styles.postcode}`}
              onChange={(e) => checkPostcode(e.target.value.replace(/\D/g, ""))}
            />
            <p
              id="postnummer-svar"
              aria-live="polite"
              className={styles.answer}
            >
              {check.state === "ok" && (
                <span className={styles.success}>
                  <CheckIcon size={16} /> Vi leverer til {check.postcode}{" "}
                  {check.town}. Levering: {kroner(check.feeOere)}
                </span>
              )}
              {check.state === "outside" && (
                <span className={styles.error}>
                  Vi leverer ikke til {check.postcode}. Vælg afhentning i
                  butikken i stedet.
                </span>
              )}
              {check.state === "error" && (
                <span className={styles.error}>
                  Vi kunne ikke tjekke postnummeret. Prøv igen.
                </span>
              )}
            </p>
            {check.state === "outside" && rules?.pickupEnabled && (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setFulfilment("pickup")}
              >
                Hent i butikken i {SHOP.town} i stedet
              </button>
            )}
          </div>
        )}

        <fieldset className={styles.group}>
          <legend className={styles.label}>
            {fulfilment === "delivery"
              ? "Hvornår skal den frem?"
              : "Hvornår vil du hente?"}
          </legend>
          {dates === null ? (
            <p className="muted">Henter ledige dage …</p>
          ) : (
            <div className={styles.row3} role="radiogroup" aria-label="Dag">
              {quick.map((q) => (
                <button
                  key={q.date}
                  type="button"
                  role="radio"
                  aria-checked={date === q.date}
                  className={styles.choice}
                  onClick={() => {
                    setDate(q.date);
                    setShowAll(false);
                    setSlot(null);
                  }}
                >
                  <span className={styles.choiceMain}>
                    {q.label}
                    {date === q.date && <CheckIcon size={18} />}
                  </span>
                  <span className={styles.choiceSub}>{shortDate(q.date)}</span>
                </button>
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={otherChosen}
                className={styles.choice}
                onClick={() => setShowAll(true)}
              >
                <span className={styles.choiceMain}>
                  Anden dato
                  {otherChosen && <CheckIcon size={18} />}
                </span>
                <span className={styles.choiceSub}>
                  {otherChosen ? shortDate(date!) : "vælg"}
                </span>
              </button>
            </div>
          )}
          {showAll && dates && (
            <div className={styles.field}>
              <label htmlFor="dato" className={styles.label}>
                Vælg dag
              </label>
              <select
                id="dato"
                className={styles.input}
                value={otherChosen ? date! : ""}
                onChange={(e) => {
                  setDate(e.target.value || null);
                  setSlot(null);
                }}
              >
                <option value="">Vælg en dag</option>
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {longDate(d)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {fulfilment === "delivery" && rules && (
            <p className="muted">
              {/* A cut-off of 00:00 means no same-day delivery (the owner,
                  27 Nov: orders by the day before). */}
              {rules.sameDayCutoff.startsWith("00:00")
                ? "Bestil senest dagen før, du ønsker levering."
                : `Bestil inden kl. ${rules.sameDayCutoff.slice(0, 2).replace(/^0/, "")} for levering samme dag.`}
            </p>
          )}
        </fieldset>

        {fulfilment === "pickup" && date && (
          <fieldset className={styles.group}>
            <legend className={styles.label}>Tidspunkt {longDate(date)}</legend>
            {slots === null ? (
              <p className="muted">Henter tidspunkter …</p>
            ) : slots.length === 0 ? (
              <p>Der kan ikke hentes den dag. Vælg en anden dag.</p>
            ) : (
              <div
                className={styles.slots}
                role="radiogroup"
                aria-label="Tidspunkt"
              >
                {slots.map((s) => (
                  <button
                    key={s.hour}
                    type="button"
                    role="radio"
                    aria-checked={slot === s.hour}
                    disabled={!s.available}
                    className={styles.choice}
                    onClick={() => setSlot(s.hour)}
                  >
                    <span className={styles.choiceMain}>
                      {s.available ? s.label : <s>{s.label}</s>}
                      {slot === s.hour && <CheckIcon size={18} />}
                    </span>
                    {!s.available && (
                      <span className={styles.choiceSub}>fuldt</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <p className="muted">
              Om morgenen får du en e-mail med tidspunkt og adresse.
            </p>
          </fieldset>
        )}
      </section>

      <div className={styles.field}>
        <label htmlFor="kort" className={styles.label}>
          Hilsen på kortet (valgfrit)
        </label>
        <textarea
          id="kort"
          rows={4}
          maxLength={MAX_CARD}
          value={card}
          aria-describedby="kort-taeller"
          className={styles.input}
          onChange={(e) => setCard(e.target.value)}
        />
        <p id="kort-taeller" className="muted">
          {card.length} / {MAX_CARD} tegn
        </p>
      </div>

      <div className={styles.cta}>
        {price && (
          <p className="muted">
            {TIER_NAME[tier]} {kroner(price.priceOere)}
            {fulfilment === "delivery"
              ? fee > 0
                ? ` + levering ${kroner(fee)} = ${kroner(price.priceOere + fee)} inkl. moms`
                : " + levering (vælg postnummer)"
              : ` + afhentning 0 kr. = ${kroner(price.priceOere)} inkl. moms`}
          </p>
        )}
        <button
          type="button"
          className={styles.primary}
          disabled={!ready}
          onClick={add}
        >
          Læg i kurven
        </button>
        {!ready && (
          <p className="muted" aria-live="polite">
            {occasion.soldOut
              ? "Buketten er udsolgt lige nu."
              : `Vælg først ${missing.join(", ")}.`}
          </p>
        )}
      </div>

      <dialog
        ref={confirmDialog}
        className={styles.confirm}
        aria-labelledby="flyt-titel"
      >
        <h2 id="flyt-titel" className={styles.heading}>
          Ændre levering for hele kurven?
        </h2>
        <p>
          Der er allerede buketter i kurven til en anden dag eller adresse. En
          bestilling har én levering, så de flyttes med til det, du lige har
          valgt.
        </p>
        <div className={styles.stack}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              if (pending.current) {
                addMovingDelivery(
                  pending.current.line,
                  pending.current.delivery,
                );
                confirmDialog.current?.close();
                showAdded(pending.current.line);
              }
            }}
          >
            Ja, flyt hele kurven
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => confirmDialog.current?.close()}
          >
            Nej, behold kurven som den er
          </button>
        </div>
      </dialog>

      <dialog ref={sheet} className={styles.sheet} aria-labelledby="lagt-titel">
        {added && cart && (
          <>
            <p id="lagt-titel" className={styles.successTitle}>
              <CheckIcon size={18} /> Lagt i kurven
            </p>
            <p>
              <strong>
                {added.name} · {TIER_NAME[added.tier]}
              </strong>
              <br />
              <span className="muted">
                {cart.delivery?.fulfilment === "delivery"
                  ? `Levering ${shortDate(cart.delivery.date)} til ${cart.delivery.postcode}`
                  : cart.delivery
                    ? `Afhentning ${shortDate(cart.delivery.date)} kl. ${cart.delivery.pickupSlotHour}–${cart.delivery.pickupSlotHour + 1}`
                    : ""}
              </span>
            </p>
            <p className={styles.total}>
              <span>Kurven i alt</span>
              <span>{kroner(cartTotal)}</span>
            </p>
            <div className={styles.stack}>
              {/* Close first: Next keeps the left page alive in the
                  background, and an open modal would block the next one. */}
              <Link
                href="/kurv"
                className={styles.primary}
                onClick={() => sheet.current?.close()}
              >
                Gå til kurven
              </Link>
              <Link
                href="/anledninger"
                className={styles.secondary}
                onClick={() => sheet.current?.close()}
              >
                Se flere buketter
              </Link>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}

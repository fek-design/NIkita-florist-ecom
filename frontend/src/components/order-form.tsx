"use client";

// The choices on the occasion page (hi-fi S4, S4b, S4c, S5): size, delivery
// or pickup, postcode with the fee (P3, DD-14), date (P2), pickup slot
// (DD-18), a card and wishes per bouquet behind links (occasion-page-choices),
// and "Læg i kurven". The place field takes a postcode or a town. Prices
// shown here are for reading only; checkout recalculates everything on the
// server.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";
import {
  addMovingDelivery,
  addToCart,
  cartTotals,
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
const MAX_WISH = 200;

type Place = { postcode: string; town: string };

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
  const [showCard, setShowCard] = useState(false);
  const [wish, setWish] = useState("");
  const [showWish, setShowWish] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [active, setActive] = useState(-1);
  const latestQuery = useRef("");
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

  /** The zone and fee check for one postcode (unchanged rules, P3). */
  async function lookUp(code: string) {
    setCheck({ state: "checking" });
    try {
      const res = await fetch(`/api/delivery/postcodes/${code}`);
      const body = (await res.json()) as {
        inZone: boolean;
        town: string | null;
        feeOere: number | null;
      };
      setCheck(
        body.inZone
          ? {
              state: "ok",
              postcode: code,
              town: body.town ?? "",
              feeOere: body.feeOere ?? 0,
            }
          : { state: "outside", postcode: code },
      );
    } catch {
      setCheck({ state: "error" });
    }
  }

  /**
   * A postcode or the start of a town (occasion-page-choices). Four digits
   * are checked at once; anything else asks for suggestions from the shop's
   * own delivery list. A town with no suggestion is outside the zone.
   */
  async function typePlace(value: string) {
    setPostcode(value);
    setActive(-1);
    const q = value.trim();
    latestQuery.current = q;
    if (/^[0-9]{4}$/.test(q)) {
      setPlaces([]);
      await lookUp(q);
      return;
    }
    setCheck({ state: "idle" });
    if (q.length < 2) {
      setPlaces([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/delivery/places?q=${encodeURIComponent(q)}`,
      );
      const body = (await res.json()) as { places: Place[] };
      if (latestQuery.current !== q) return; // a newer keystroke won
      setPlaces(body.places);
      if (body.places.length === 0 && /[a-zæøå]{3,}/i.test(q)) {
        setCheck({ state: "outside", postcode: q });
      }
    } catch {
      setPlaces([]);
    }
  }

  function choosePlace(place: Place) {
    latestQuery.current = place.postcode;
    setPostcode(`${place.postcode} ${place.town}`);
    setPlaces([]);
    setActive(-1);
    void lookUp(place.postcode);
  }

  function placeKeys(e: React.KeyboardEvent<HTMLInputElement>) {
    if (places.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % places.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? places.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choosePlace(places[active]!);
    } else if (e.key === "Escape") {
      setPlaces([]);
      setActive(-1);
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
    missing.push("et postnummer eller en by, vi leverer til");
  if (!date) missing.push("en dag");
  if (fulfilment === "pickup" && slot === null) missing.push("et tidspunkt");
  const ready = missing.length === 0 && price !== undefined;
  const cardPrice = rules?.cardPriceOere ?? 2000;
  const cardText = showCard ? card.trim() : "";
  const cardCost = cardText ? cardPrice : 0;

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
      cardMessage: cardText,
      cardPriceOere: cardCost,
      wish: showWish ? wish.trim() : "",
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
  const cartTotal = cart ? cartTotals(cart).totalOere : 0;

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
              Postnummer eller by
            </label>
            {/* ARIA combobox: suggestions from the shop's own delivery list,
                arrow keys and Enter to choose, Escape to close. */}
            <div className={styles.combo}>
              <input
                id="postnummer"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={places.length > 0}
                aria-controls="steder"
                aria-activedescendant={
                  active >= 0 ? `sted-${active}` : undefined
                }
                autoComplete="off"
                maxLength={40}
                value={postcode}
                aria-invalid={check.state === "outside"}
                aria-describedby="postnummer-svar"
                className={`${styles.input} ${styles.postcode}`}
                onChange={(e) => typePlace(e.target.value)}
                onKeyDown={placeKeys}
                onBlur={() => setTimeout(() => setPlaces([]), 150)}
              />
              {places.length > 0 && (
                <ul id="steder" role="listbox" className={styles.places}>
                  {places.map((p, i) => (
                    <li
                      key={p.postcode}
                      id={`sted-${i}`}
                      role="option"
                      aria-selected={i === active}
                      className={styles.place}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        choosePlace(p);
                      }}
                    >
                      {p.postcode} {p.town}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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

      {/* Card and wishes per bouquet, behind links: shown only to those
          who want them (occasion-page-choices; Baymard: optional fields
          behind a link). */}
      <div className={styles.extras}>
        {showCard ? (
          <div className={styles.field}>
            <label htmlFor="kort" className={styles.label}>
              Hilsen på kortet ({kroner(cardPrice)})
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
            <button
              type="button"
              className={styles.more}
              onClick={() => setShowCard(false)}
            >
              Fjern kortet
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.more}
            onClick={() => setShowCard(true)}
          >
            + Tilføj et kort ({kroner(cardPrice)})
          </button>
        )}

        {showWish ? (
          <div className={styles.field}>
            <label htmlFor="oenske" className={styles.label}>
              Ønsker til buketten
            </label>
            <textarea
              id="oenske"
              rows={3}
              maxLength={MAX_WISH}
              value={wish}
              aria-describedby="oenske-note"
              placeholder="Fx gerne hvide og grønne farver"
              className={styles.input}
              onChange={(e) => setWish(e.target.value)}
            />
            <p id="oenske-note" className="muted">
              Nikita binder med sæsonens blomster og følger dit ønske, så vidt
              det kan lade sig gøre.
            </p>
            <button
              type="button"
              className={styles.more}
              onClick={() => setShowWish(false)}
            >
              Fjern ønsket
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.more}
            onClick={() => setShowWish(true)}
          >
            + Ønsker til buketten
          </button>
        )}
      </div>

      <div className={styles.cta}>
        {price && (
          <p className="muted">
            {TIER_NAME[tier]} {kroner(price.priceOere)}
            {cardCost > 0 ? ` + kort ${kroner(cardCost)}` : ""}
            {fulfilment === "delivery"
              ? fee > 0
                ? ` + levering ${kroner(fee)} = ${kroner(price.priceOere + cardCost + fee)} inkl. moms`
                : " + levering (vælg postnummer eller by)"
              : ` + afhentning 0 kr. = ${kroner(price.priceOere + cardCost)} inkl. moms`}
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

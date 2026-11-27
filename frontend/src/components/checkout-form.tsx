"use client";

// Checkout (hi-fi S7, spec checkout): guest details, recipient and "if
// nobody is home" for a delivery (DD-19), the latest time for Bisættelse,
// the email checked three ways (DD-25), the order summary, the fresh-flower
// note (P12) and "Betal X kr.". The server prices the order again and opens
// the payment page; the customer chooses MobilePay or card there (D-016).
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CaretLeftIcon } from "@/components/icons";
import { cartTotals } from "@/lib/cart-store";
import { deliveryDay, deliveryWhere } from "@/lib/delivery-text";
import { suggestEmail } from "@/lib/email-typo";
import { kroner } from "@/lib/format";
import { TIER_NAME, useCart, useRefreshedPrices } from "@/lib/use-cart";
import form from "./order-form.module.css";
import styles from "./checkout-form.module.css";

const SAVED = "nn-betaling";

type NotHome = "door" | "neighbour" | "call_buyer";

type Fields = {
  name: string;
  email: string;
  emailRepeat: string;
  phone: string;
  recipientName: string;
  address: string;
  co: string;
  recipientPhone: string;
  notHome: NotHome | "";
  latestTime: string;
};

const EMPTY: Fields = {
  name: "",
  email: "",
  emailRepeat: "",
  phone: "",
  recipientName: "",
  address: "",
  co: "",
  recipientPhone: "",
  notHome: "",
  latestTime: "",
};

const NOT_HOME: { value: NotHome; label: string }[] = [
  { value: "door", label: "Stil den ved døren" },
  { value: "neighbour", label: "Aflevér den hos en nabo" },
  { value: "call_buyer", label: "Ring til mig" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kept for this visit, so a cancelled payment does not empty the form. */
function loadSaved(): Fields {
  try {
    const raw = sessionStorage.getItem(SAVED);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Fields>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

const noop = () => () => {};

export function CheckoutForm({ cancelled }: { cancelled: boolean }) {
  // The cart and the saved form live in the browser: render after hydration.
  const inBrowser = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  if (!inBrowser) return <div className={styles.page} aria-busy="true" />;
  return <Checkout cancelled={cancelled} />;
}

function Checkout({ cancelled }: { cancelled: boolean }) {
  const cart = useCart();
  const notes = useRefreshedPrices(cart);
  const [fields, setFields] = useState<Fields>(loadSaved);
  const [showCo, setShowCo] = useState(() => fields.co !== "");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {},
  );
  const [general, setGeneral] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Kept as the customer types, so "Tilbage til kurven" or a cancelled
  // payment brings them back to a filled form (this visit only).
  useEffect(() => {
    try {
      sessionStorage.setItem(SAVED, JSON.stringify(fields));
    } catch {
      // Without storage the form is simply not kept.
    }
  }, [fields]);

  const delivery = cart.delivery;
  if (cart.lines.length === 0 || !delivery) {
    return (
      <div className={styles.page}>
        <h1>Betaling</h1>
        <p>Kurven er tom.</p>
        <Link href="/anledninger" className={form.primary}>
          Se buketterne
        </Link>
      </div>
    );
  }

  const isDelivery = delivery.fulfilment === "delivery";
  const isFuneral = cart.lines.some((l) => l.slug === "bisaettelse");
  const { totalOere, feeOere } = cartTotals(cart);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function check(f: Fields) {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!f.name.trim()) e.name = "Skriv dit navn.";
    if (!EMAIL.test(f.email.trim()))
      e.email = "Skriv en e-mail som navn@eksempel.dk.";
    else if (
      f.email.trim().toLowerCase() !== f.emailRepeat.trim().toLowerCase()
    )
      e.emailRepeat = "De to e-mails skal være ens.";
    if (f.phone.replace(/\D/g, "").length < 8)
      e.phone = "Skriv et telefonnummer med 8 cifre.";
    if (isDelivery) {
      if (!f.recipientName.trim()) e.recipientName = "Skriv modtagerens navn.";
      if (!f.address.trim()) e.address = "Skriv adressen.";
      if (!f.notHome) e.notHome = "Vælg, hvad vi gør, hvis ingen er hjemme.";
    }
    return e;
  }

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    setGeneral(null);
    const found = check(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      document.getElementById(`felt-${first}`)?.focus();
      return;
    }
    try {
      sessionStorage.setItem(SAVED, JSON.stringify(fields));
    } catch {
      // Without storage the form is simply not kept.
    }

    const address = fields.co.trim()
      ? `${fields.address.trim()}, c/o ${fields.co.trim()}`
      : fields.address.trim();
    const body = {
      items: cart.lines.map((l) => ({
        slug: l.slug,
        tier: l.tier,
        quantity: l.quantity,
        ...(l.cardMessage ? { cardMessage: l.cardMessage } : {}),
      })),
      fulfilment: delivery!.fulfilment,
      date: delivery!.date,
      buyer: {
        name: fields.name.trim(),
        email: fields.email.trim(),
        emailRepeat: fields.emailRepeat.trim(),
        phone: fields.phone.trim(),
      },
      ...(delivery!.fulfilment === "delivery"
        ? {
            postcode: delivery!.postcode,
            recipient: {
              name: fields.recipientName.trim(),
              address,
              ...(fields.recipientPhone.trim()
                ? { phone: fields.recipientPhone.trim() }
                : {}),
            },
            notHome: fields.notHome,
            ...(isFuneral && fields.latestTime
              ? { latestTime: fields.latestTime }
              : {}),
          }
        : { pickupSlotHour: delivery!.pickupSlotHour }),
    };

    setSending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 201) {
        const { url } = (await res.json()) as { url: string };
        window.location.assign(url);
        return;
      }
      setSending(false);
      if (res.status === 422 || res.status === 409) {
        const { problems } = (await res.json()) as {
          problems: { code: string }[];
        };
        showProblems(problems.map((p) => p.code));
        return;
      }
      setGeneral(
        "Betalingen kan ikke startes lige nu. Prøv igen om lidt, eller ring til os.",
      );
    } catch {
      setSending(false);
      setGeneral("Der er ingen forbindelse. Tjek internettet og prøv igen.");
    }
  }

  function showProblems(codes: string[]) {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (codes.includes("email_invalid"))
      e.email = "Skriv en e-mail som navn@eksempel.dk.";
    if (codes.includes("email_mismatch"))
      e.emailRepeat = "De to e-mails skal være ens.";
    if (codes.includes("recipient_missing"))
      e.recipientName = "Skriv modtagerens navn.";
    if (codes.includes("not_home_missing"))
      e.notHome = "Vælg, hvad vi gør, hvis ingen er hjemme.";
    setErrors(e);
    if (codes.includes("slot_full") || codes.includes("slot_unavailable")) {
      setGeneral(
        "Tidspunktet er desværre optaget. Vælg et andet tidspunkt i kurven.",
      );
    } else if (
      codes.includes("day_full") ||
      codes.includes("date_unavailable")
    ) {
      setGeneral("Dagen kan desværre ikke længere vælges. Vælg en anden dag.");
    } else if (codes.includes("outside_zone")) {
      setGeneral(
        "Vi leverer ikke til det postnummer. Vælg afhentning i stedet.",
      );
    } else if (Object.keys(e).length === 0) {
      setGeneral(
        "Noget i kurven kan ikke bestilles lige nu. Gå tilbage til kurven og tjek den.",
      );
    }
  }

  const error = (key: keyof Fields) =>
    errors[key] ? (
      <p id={`fejl-${key}`} className={styles.error}>
        {errors[key]}
      </p>
    ) : null;

  const input = (
    key: keyof Fields,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    hint?: string,
  ) => (
    <div className={form.field}>
      <label htmlFor={`felt-${key}`} className={form.label}>
        {label}
      </label>
      <input
        id={`felt-${key}`}
        className={form.input}
        value={fields[key]}
        onChange={(e) => set(key, e.target.value as Fields[typeof key])}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={
          [errors[key] && `fejl-${key}`, hint && `hint-${key}`]
            .filter(Boolean)
            .join(" ") || undefined
        }
        {...props}
      />
      {error(key)}
      {hint && (
        <p id={`hint-${key}`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );

  return (
    <form className={styles.page} onSubmit={pay} noValidate>
      <div className={styles.top}>
        {/* Baymard: let people step back to the cart without losing the
            form; it is kept in this visit's storage on the way. */}
        <Link href="/kurv" className={styles.back}>
          <CaretLeftIcon /> Tilbage til kurven
        </Link>
        <h1>Betaling</h1>
      </div>

      {cancelled && (
        <p className={styles.notice} role="status">
          Betalingen blev afbrudt, og der er ikke trukket penge. Dine
          oplysninger er gemt herunder.
        </p>
      )}
      {notes.length > 0 && (
        <div className={styles.notice} role="status">
          {notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}

      <fieldset className={styles.section}>
        <legend className={styles.heading}>Dine oplysninger</legend>
        {input("name", "Navn", { autoComplete: "name" })}
        <div className={form.field}>
          <label htmlFor="felt-email" className={form.label}>
            E-mail
          </label>
          <input
            id="felt-email"
            className={form.input}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => {
              set("email", e.target.value);
              setSuggestion(null);
            }}
            onBlur={(e) => setSuggestion(suggestEmail(e.target.value))}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={
              [errors.email && "fejl-email", "hint-email"]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          {error("email")}
          {suggestion && (
            <p className={styles.suggestion} role="status">
              Mente du <strong>{suggestion}</strong>?{" "}
              <button
                type="button"
                onClick={() => {
                  set("email", suggestion);
                  setSuggestion(null);
                }}
              >
                Ja, ret den
              </button>
              <button type="button" onClick={() => setSuggestion(null)}>
                Nej
              </button>
            </p>
          )}
          <p id="hint-email" className={styles.hint}>
            Vi sender kvitteringen hertil.
          </p>
        </div>
        {input("emailRepeat", "Gentag e-mail", {
          type: "email",
          inputMode: "email",
          autoComplete: "email",
        })}
        {input("phone", "Telefon", { type: "tel", autoComplete: "tel" })}
      </fieldset>

      {isDelivery && delivery.fulfilment === "delivery" && (
        <fieldset className={styles.section}>
          <legend className={styles.heading}>Modtager</legend>
          {input("recipientName", "Navn", { autoComplete: "off" })}
          <div className={form.field}>
            {input("address", "Adresse", {
              autoComplete: "street-address",
            })}
            {showCo ? (
              input("co", "Firma eller c/o (valgfrit)")
            ) : (
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => setShowCo(true)}
              >
                + Tilføj firma eller c/o
              </button>
            )}
          </div>
          <div className={form.field}>
            <p className={form.label} id="postnummer-label">
              Postnummer og by
            </p>
            <p className={styles.fixed} aria-labelledby="postnummer-label">
              <span>
                {delivery.postcode} {delivery.town}
              </span>
              <Link href="/kurv">
                Ret<span className="visually-hidden"> postnummer</span>
              </Link>
            </p>
          </div>
          {input(
            "recipientPhone",
            "Telefon (valgfrit)",
            { type: "tel" },
            "Bruges kun, hvis vi ikke kan finde adressen.",
          )}
          {isFuneral &&
            input(
              "latestTime",
              "Hvornår skal blomsterne senest være der? (valgfrit)",
              { type: "time", min: "07:00", max: "18:00" },
              "Fx når bisættelsen begynder.",
            )}
        </fieldset>
      )}

      {isDelivery && (
        <fieldset
          className={styles.section}
          aria-describedby={errors.notHome ? "fejl-notHome" : undefined}
        >
          <legend className={styles.heading}>Hvis ingen er hjemme</legend>
          <div className={styles.options} id="felt-notHome" tabIndex={-1}>
            {NOT_HOME.map((o) => (
              <label key={o.value} className={styles.option}>
                <input
                  type="radio"
                  name="notHome"
                  value={o.value}
                  checked={fields.notHome === o.value}
                  onChange={() => set("notHome", o.value)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          {error("notHome")}
        </fieldset>
      )}

      <section className={styles.summary} aria-labelledby="din-ordre">
        <h2 id="din-ordre">Din ordre</h2>
        <ul>
          {cart.lines.map((l, i) => (
            <li key={i}>
              {l.quantity > 1 ? `${l.quantity} × ` : ""}
              {l.name} · {TIER_NAME[l.tier]} –{" "}
              {kroner(l.unitPriceOere * l.quantity)}
            </li>
          ))}
          <li>
            {deliveryWhere(delivery)}, {deliveryDay(delivery).toLowerCase()}
            {isDelivery ? ` – ${kroner(feeOere)}` : ""}
          </li>
        </ul>
        <p className={styles.sum}>I alt inkl. moms: {kroner(totalOere)}</p>
        {fields.email.trim() && <p>Kvittering til: {fields.email.trim()}</p>}
      </section>

      <section className={styles.section} aria-labelledby="betal-med">
        <h2 id="betal-med" className={styles.heading}>
          Betal med
        </h2>
        <p>
          MobilePay eller kort (Dankort, Visa, Mastercard). Du vælger på næste
          side.
        </p>
      </section>

      <div className={styles.cta}>
        <p className={styles.hint}>
          Friske blomster holder kort tid, så de er undtaget fra
          fortrydelsesretten.{" "}
          <Link href="/handelsbetingelser">Læs handelsbetingelserne</Link>.
        </p>
        {general && (
          <p className={styles.error} role="alert">
            {general}{" "}
            {general.includes("kurven") && <Link href="/kurv">Til kurven</Link>}
          </p>
        )}
        <button type="submit" className={form.primary} disabled={sending}>
          {sending ? "Åbner betalingen …" : `Betal ${kroner(totalOere)}`}
        </button>
        <p className={styles.hint}>
          Du sendes videre til betalingen og tilbage hertil, når du har betalt.
        </p>
      </div>
    </form>
  );
}

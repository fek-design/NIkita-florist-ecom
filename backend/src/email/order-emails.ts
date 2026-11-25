// The two emails sent when an order is paid (spec orders: "Emails when an
// order is paid"): the confirmation to the buyer (S8 content) and the order
// slip to the owner (P1, DD-16). Written to the outbox first (D-011), then
// sent at once; a failed send stays in the outbox for week 4's retry job.
import { and, asc, eq, inArray } from "drizzle-orm";
import type { Db } from "../catalog/queries.js";
import {
  deliveryPostcodes,
  emailOutbox,
  orderLines,
  orders,
} from "../db/schema.js";
import { formatKroner } from "../lib/money.js";

export type Mail = { to: string; subject: string; html: string; text: string };
export type Mailer = { send: (mail: Mail) => Promise<void> };

/** The shop's details as shown on emails (public, from the owner; P8). */
export const SHOP = {
  name: "Nikita Nielsen",
  address: "Tuse Byvej 94, 4300 Tuse",
  phone: "+45 28 25 74 13",
  email: "Nikita_nielsen@hotmail.com",
  // CVR: not supplied by the owner yet; added to the footer when it is.
} as const;

const TIER = { lille: "Lille", mellem: "Mellem", stor: "Stor" } as const;
const NOT_HOME = {
  door: "Stil den ved døren",
  neighbour: "Aflever hos en nabo",
  call_buyer: "Ring til køberen",
} as const;

/** Everything a customer typed goes through this before it reaches HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "tirsdag 24. november" */
export function danishLongDate(date: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

type OrderForEmail = Awaited<ReturnType<typeof loadOrders>>[number];

async function loadOrders(db: Db, ids: number[]) {
  const rows = await db.select().from(orders).where(inArray(orders.id, ids));
  return Promise.all(
    rows.map(async (order) => {
      const lines = await db
        .select()
        .from(orderLines)
        .where(eq(orderLines.orderId, order.id))
        .orderBy(asc(orderLines.lineNo));
      const [zone] = order.recipientPostcode
        ? await db
            .select({ town: deliveryPostcodes.town })
            .from(deliveryPostcodes)
            .where(eq(deliveryPostcodes.postcode, order.recipientPostcode))
        : [];
      return { order, lines, town: zone?.town ?? null };
    }),
  );
}

function when({ order }: OrderForEmail): string {
  const day = danishLongDate(order.fulfilmentDate);
  if (order.fulfilment === "pickup") {
    const h = order.pickupSlotHour!;
    return `Afhentning ${day} kl. ${h}–${h + 1}`;
  }
  const latest = order.latestTime
    ? `, senest kl. ${order.latestTime.slice(0, 5)}`
    : "";
  return `Levering ${day} i løbet af dagen${latest}`;
}

function where({ order, town }: OrderForEmail): string {
  if (order.fulfilment === "pickup") return `${SHOP.name}, ${SHOP.address}`;
  return `${order.recipientName}, ${order.recipientAddress}, ${order.recipientPostcode} ${town ?? ""}`.trim();
}

export function confirmationEmail(data: OrderForEmail): Mail {
  const { order, lines } = data;
  const subject = `Tak for din bestilling, ordre ${order.number}`;
  const lineText = lines.map(
    (l) =>
      `${l.quantity} × ${l.occasionName} · ${TIER[l.tier]}: ${formatKroner(l.unitPriceOere * l.quantity)}`,
  );
  const cards = lines.filter((l) => l.cardMessage).map((l) => l.cardMessage);
  const notHome =
    order.fulfilment === "delivery" && order.notHome
      ? `Er ingen hjemme: ${NOT_HOME[order.notHome].toLowerCase()}.`
      : "";
  const text = [
    `Tak for din bestilling hos ${SHOP.name}.`,
    "",
    `Ordre ${order.number}`,
    ...lineText,
    order.deliveryFeeOere > 0
      ? `Levering: ${formatKroner(order.deliveryFeeOere)}`
      : "",
    `I alt inkl. moms: ${formatKroner(order.totalOere)}`,
    "",
    when(data),
    where(data),
    notHome,
    ...cards.map((c) => `Kortet lyder: "${c}"`),
    "",
    `Spørgsmål? Ring til ${SHOP.phone} eller skriv til ${SHOP.email}.`,
    `${SHOP.name} · ${SHOP.address}`,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  const e = escapeHtml;
  const html = `<!doctype html><html lang="da"><body style="margin:0;background:#f7f4ef;color:#2d2a26;font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.55">
<div style="max-width:480px;margin:0 auto;padding:32px 24px">
<p style="color:#36602f;font-weight:600;margin:0 0 8px">✓ Betalingen er gennemført</p>
<h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;margin:0 0 16px">Tak for din bestilling</h1>
<p style="margin:0 0 16px">Ordre ${order.number}</p>
<div style="background:#dcd4d1;border-radius:4px;padding:16px;margin:0 0 16px">
${lineText.map((l) => `<p style="margin:0">${e(l)}</p>`).join("")}
${order.deliveryFeeOere > 0 ? `<p style="margin:0">Levering: ${formatKroner(order.deliveryFeeOere)}</p>` : ""}
<p style="margin:8px 0 0;font-weight:600">I alt inkl. moms: ${formatKroner(order.totalOere)}</p>
</div>
<p style="margin:0 0 4px;font-weight:600">${e(when(data))}</p>
<p style="margin:0 0 4px">${e(where(data))}</p>
${notHome ? `<p style="margin:0 0 4px">${e(notHome)}</p>` : ""}
${cards.map((c) => `<p style="margin:12px 0 0">Kortet lyder: “${e(c)}”</p>`).join("")}
<p style="margin:24px 0 0">Spørgsmål? Ring til ${SHOP.phone} eller skriv til ${SHOP.email}.</p>
<p style="margin:8px 0 0;color:#7a644f;font-size:14px">${SHOP.name} · ${SHOP.address}</p>
</div></body></html>`;
  return { to: order.buyerEmail ?? "", subject, html, text };
}

/** The owner's slip: printed for the pinboard (P1). Black and white, 80 mm. */
export function ownerSlipEmail(data: OrderForEmail, ownerEmail: string): Mail {
  const { order, lines } = data;
  const e = escapeHtml;
  const head = order.fulfilment === "pickup" ? "AFHENTNING" : "LEVERING";
  const day = danishLongDate(order.fulfilmentDate).toUpperCase();
  const time =
    order.fulfilment === "pickup"
      ? `KL. ${order.pickupSlotHour}–${order.pickupSlotHour! + 1}`
      : order.latestTime
        ? `SENEST KL. ${order.latestTime.slice(0, 5)}`
        : "I LØBET AF DAGEN";
  const subject = `${head} ${danishLongDate(order.fulfilmentDate)} · #${order.number}`;
  const bouquets = lines.map((l) =>
    `${l.quantity > 1 ? `${l.quantity} × ` : ""}${l.occasionName} · ${TIER[l.tier]}`.toUpperCase(),
  );
  const cards = lines.filter((l) => l.cardMessage).map((l) => l.cardMessage);
  const to =
    order.fulfilment === "delivery"
      ? [
          order.recipientName,
          order.recipientAddress,
          `${order.recipientPostcode} ${data.town ?? ""}`.trim(),
        ]
      : [];
  const notHome = order.notHome
    ? `Ikke hjemme: ${NOT_HOME[order.notHome].toLowerCase()}`
    : "";
  const from = `${order.buyerName} · ${order.buyerPhone}`;
  const paid = `Betalt ${formatKroner(order.totalOere)} online`;

  const text = [
    head,
    `${day} · ${time}`,
    `#${order.number}`,
    "",
    ...bouquets,
    "",
    ...cards.map((c) => `KORT: ${c}`),
    "",
    ...(to.length ? ["TIL", ...to, notHome, ""] : []),
    "FRA",
    from,
    paid,
  ].join("\n");

  const html = `<!doctype html><html lang="da"><head><style>@page{size:80mm auto;margin:0}body{margin:0}</style></head>
<body style="font-family:Arial,sans-serif;color:#000;background:#fff">
<div style="width:302px;padding:16px 12px 24px">
<div style="background:#000;color:#fff;padding:8px 10px">
<div style="font-weight:700;font-size:14px">${head}</div>
<div style="font-weight:700;font-size:24px;line-height:1.2">${e(day)}<br>${e(time)}</div>
<div style="font-size:12px">#${order.number}</div>
</div>
<hr style="border:0;border-top:1px solid #000;margin:10px 0">
${bouquets.map((b) => `<div style="font-weight:700;font-size:20px">${e(b)}</div>`).join("")}
${cards.map((c) => `<div style="border:2px solid #000;padding:8px 10px;margin:10px 0"><div style="font-weight:700;font-size:12px">KORT</div><div style="font-size:18px;line-height:1.4">${e(c)}</div></div>`).join("")}
${to.length ? `<hr style="border:0;border-top:1px solid #000;margin:10px 0"><div style="font-size:16px">TIL<br>${to.map((t) => e(t ?? "")).join("<br>")}</div>${notHome ? `<div style="font-weight:700;font-size:14px;margin-top:6px">${e(notHome)}</div>` : ""}` : ""}
<hr style="border:0;border-top:1px solid #000;margin:10px 0">
<div style="font-size:14px">FRA<br>${e(from)}</div>
<div style="font-size:12px;margin-top:6px">${e(paid)}</div>
</div></body></html>`;
  return { to: ownerEmail, subject, html, text };
}

export type EmailSettings = { ownerEmail: string };

/**
 * Writes the two emails for each newly paid order to the outbox (once per
 * order and kind) and tries to send them now. Never throws: a failure is
 * recorded on the outbox row for the retry job.
 */
export async function sendPaidOrderEmails(
  db: Db,
  mailer: Mailer | null,
  orderIds: number[],
  settings: EmailSettings,
  now: Date = new Date(),
): Promise<{ queued: number; sent: number; failed: number }> {
  const result = { queued: 0, sent: 0, failed: 0 };
  if (orderIds.length === 0) return result;
  for (const data of await loadOrders(db, orderIds)) {
    const mails = [
      { kind: "confirmation" as const, mail: confirmationEmail(data) },
      {
        kind: "owner_slip" as const,
        mail: ownerSlipEmail(data, settings.ownerEmail),
      },
    ].filter((m) => m.mail.to);
    for (const { kind, mail } of mails) {
      const [row] = await db
        .insert(emailOutbox)
        .values({
          orderId: data.order.id,
          kind,
          toAddress: mail.to,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        })
        .onConflictDoNothing()
        .returning({ id: emailOutbox.id });
      if (!row) continue; // already queued for this order: never twice
      result.queued++;
      if (!mailer) continue; // no mail settings: stays pending
      try {
        await mailer.send(mail);
        await db
          .update(emailOutbox)
          .set({ status: "sent", attempts: 1, sentAt: now })
          .where(and(eq(emailOutbox.id, row.id)));
        result.sent++;
      } catch (error) {
        await db
          .update(emailOutbox)
          .set({
            status: "failed",
            attempts: 1,
            lastError: String(error).slice(0, 500),
          })
          .where(eq(emailOutbox.id, row.id));
        result.failed++;
      }
    }
  }
  return result;
}

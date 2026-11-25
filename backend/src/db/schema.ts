// The catalogue: occasions sold in three priced tiers, their photos, and the
// shop's delivery rules. Money is whole øre including moms (decision D-007).
// Rules the database can enforce are enforced here; the one rule that spans
// rows (prices rise from Lille to Stor) is a trigger in migration 0002.
import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/** Postgres orders enum values as declared, so lille < mellem < stor. */
export const tier = pgEnum("tier", ["lille", "mellem", "stor"]);

/** main: the product shot; scale: shows the size; detail: a close-up (P6). */
export const photoRole = pgEnum("photo_role", ["main", "scale", "detail"]);

export const occasions = pgTable(
  "occasions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    intro: text().notNull().default(""),
    description: text().notNull().default(""),
    sortOrder: integer().notNull().default(0),
    isVisible: boolean().notNull().default(true),
    isSoldOut: boolean().notNull().default(false),
    isPlaceholder: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("occasions_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("occasions_name_not_blank", sql`length(trim(${t.name})) > 0`),
  ],
);

export const occasionTiers = pgTable(
  "occasion_tiers",
  {
    occasionId: integer()
      .notNull()
      .references(() => occasions.id, { onDelete: "cascade" }),
    tier: tier().notNull(),
    priceOere: integer().notNull(),
    sizeText: text().notNull(),
    isPlaceholder: boolean().notNull().default(true),
  },
  (t) => [
    // One row per tier per occasion.
    primaryKey({ columns: [t.occasionId, t.tier] }),
    check("occasion_tiers_price_positive", sql`${t.priceOere} > 0`),
  ],
);

export const occasionPhotos = pgTable("occasion_photos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  occasionId: integer()
    .notNull()
    .references(() => occasions.id, { onDelete: "cascade" }),
  url: text().notNull(),
  alt: text().notNull(),
  role: photoRole().notNull(),
  sortOrder: integer().notNull().default(0),
});

export const deliveryPostcodes = pgTable(
  "delivery_postcodes",
  {
    postcode: char({ length: 4 }).primaryKey(),
    town: text().notNull(),
    isPlaceholder: boolean().notNull().default(true),
  },
  (t) => [
    check("delivery_postcodes_four_digits", sql`${t.postcode} ~ '^[0-9]{4}$'`),
  ],
);

export const closedDates = pgTable("closed_dates", {
  date: date().primaryKey(),
  reason: text().notNull().default(""),
});

export const shopSettings = pgTable(
  "shop_settings",
  {
    // Exactly one row: the check below only allows id 1.
    id: smallint().primaryKey().default(1),
    deliveryFeeOere: integer().notNull(),
    /** Latest order time for same-day delivery, in Danish time. */
    sameDayCutoff: time().notNull(),
    /** ISO weekdays with delivery: 1 = Monday ... 7 = Sunday. */
    deliveryWeekdays: integer().array().notNull(),
    /** Orders accepted per day. Internal: never sent to the storefront. */
    dailyCapacity: integer().notNull(),
    /** Pickups the owner can have ready per one-hour slot (DD-18). Internal. */
    pickupsPerSlot: smallint().notNull().default(4),
    pickupEnabled: boolean().notNull().default(true),
    /** Shown only, e.g. {"mon": ["10:00", "17:30"]}; days left out are closed. */
    openingHours: jsonb()
      .$type<Partial<Record<Weekday, [string, string]>>>()
      .notNull()
      .default({}),
    isPlaceholder: boolean().notNull().default(true),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("shop_settings_single_row", sql`${t.id} = 1`),
    check("shop_settings_fee_not_negative", sql`${t.deliveryFeeOere} >= 0`),
    check("shop_settings_capacity_positive", sql`${t.dailyCapacity} > 0`),
    check(
      "shop_settings_pickups_per_slot_positive",
      sql`${t.pickupsPerSlot} > 0`,
    ),
    check(
      "shop_settings_weekdays_valid",
      sql`cardinality(${t.deliveryWeekdays}) > 0 and ${t.deliveryWeekdays} <@ array[1,2,3,4,5,6,7]`,
    ),
  ],
);

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Tier = (typeof tier.enumValues)[number];

// ---------------------------------------------------------------------------
// Orders (change checkout-payment). Only the money is tracked: the owner's
// pinboard is the work status (DD-17), so there are no work states. Shop and
// phone orders (DD-21) use the same tables.

/** Where the order came from. */
export const orderSource = pgEnum("order_source", ["web", "phone", "shop"]);

/** The money: pending while paying, then paid, expired or refunded. */
export const paymentState = pgEnum("payment_state", [
  "pending",
  "paid",
  "expired",
  "refunded",
]);

/** How it is paid: online through Stripe, at pickup, or already in the shop. */
export const paymentChannel = pgEnum("payment_channel", [
  "stripe",
  "at_pickup",
  "in_shop",
]);

export const fulfilment = pgEnum("fulfilment", ["delivery", "pickup"]);

/** What to do if the recipient is not home (DD-19). */
export const notHome = pgEnum("not_home", ["door", "neighbour", "call_buyer"]);

export const orders = pgTable(
  "orders",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    /** The number people see and say: #1042. */
    number: integer()
      .notNull()
      .unique()
      .generatedAlwaysAsIdentity({ startWith: 1001 }),
    /** Unguessable, for the confirmation link; never the number. */
    token: text().notNull().unique(),
    source: orderSource().notNull(),
    paymentState: paymentState().notNull().default("pending"),
    paymentChannel: paymentChannel().notNull(),

    buyerName: text().notNull(),
    /** Required for web orders (checked below); optional for shop orders. */
    buyerEmail: text(),
    buyerPhone: text().notNull(),

    fulfilment: fulfilment().notNull(),
    /** The day it is delivered or picked up, Danish calendar date. */
    fulfilmentDate: date().notNull(),
    /** Pickup only: start hour of the one-hour slot (14 = 14–15). */
    pickupSlotHour: smallint(),
    /** Delivery only, Bisættelse: must arrive by this time (DD-19). */
    latestTime: time(),

    recipientName: text(),
    recipientAddress: text(),
    recipientPostcode: char({ length: 4 }),
    recipientPhone: text(),
    notHome: notHome(),

    /** Free text from shop and phone orders (DD-21). */
    comment: text().notNull().default(""),

    deliveryFeeOere: integer().notNull(),
    totalOere: integer().notNull(),

    stripeSessionId: text().unique(),
    /** Set when paid; refunds from Stripe refer to the payment, not the session. */
    stripePaymentIntentId: text().unique(),
    /** While pending: the order holds capacity until this moment. */
    holdExpiresAt: timestamp({ withTimezone: true }),
    paidAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Capacity is counted per day, often for one slot.
    index("orders_fulfilment_date_idx").on(t.fulfilmentDate, t.pickupSlotHour),
    check("orders_fee_not_negative", sql`${t.deliveryFeeOere} >= 0`),
    check("orders_total_positive", sql`${t.totalOere} > 0`),
    check(
      "orders_web_has_email",
      sql`${t.source} <> 'web' or (${t.buyerEmail} is not null and length(trim(${t.buyerEmail})) > 0)`,
    ),
    check(
      "orders_web_pays_online",
      sql`(${t.source} = 'web') = (${t.paymentChannel} = 'stripe')`,
    ),
    check(
      "orders_phone_is_pickup",
      sql`${t.source} <> 'phone' or ${t.fulfilment} = 'pickup'`,
    ),
    check(
      "orders_delivery_has_recipient",
      sql`${t.fulfilment} <> 'delivery' or (${t.recipientName} is not null and ${t.recipientAddress} is not null and ${t.recipientPostcode} ~ '^[0-9]{4}$' and ${t.notHome} is not null)`,
    ),
    check(
      "orders_pickup_has_slot",
      sql`(${t.fulfilment} = 'pickup') = (${t.pickupSlotHour} is not null)`,
    ),
    check(
      "orders_slot_hour_valid",
      sql`${t.pickupSlotHour} is null or ${t.pickupSlotHour} between 0 and 23`,
    ),
    check(
      "orders_latest_time_delivery_only",
      sql`${t.latestTime} is null or ${t.fulfilment} = 'delivery'`,
    ),
    check(
      "orders_pending_has_hold",
      sql`${t.paymentState} <> 'pending' or ${t.holdExpiresAt} is not null`,
    ),
  ],
);

export const orderLines = pgTable(
  "order_lines",
  {
    orderId: integer()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    lineNo: smallint().notNull(),
    occasionId: integer()
      .notNull()
      .references(() => occasions.id, { onDelete: "restrict" }),
    /** The name at the time of ordering, so old orders read correctly. */
    occasionName: text().notNull(),
    tier: tier().notNull(),
    quantity: smallint().notNull(),
    unitPriceOere: integer().notNull(),
    cardMessage: text().notNull().default(""),
  },
  (t) => [
    primaryKey({ columns: [t.orderId, t.lineNo] }),
    check("order_lines_quantity_positive", sql`${t.quantity} > 0`),
    check("order_lines_price_positive", sql`${t.unitPriceOere} > 0`),
    check(
      "order_lines_card_message_length",
      sql`char_length(${t.cardMessage}) <= 200`,
    ),
  ],
);

/** Stripe events already handled, so a repeated event does nothing. */
export const stripeEvents = pgTable("stripe_events", {
  id: text().primaryKey(),
  type: text().notNull(),
  receivedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type OrderSource = (typeof orderSource.enumValues)[number];
export type PaymentState = (typeof paymentState.enumValues)[number];

// ---------------------------------------------------------------------------
// Email outbox (D-011): every email is written here first. One confirmation
// and one slip per order, enforced by the database, so a repeated payment
// event can never send twice. Week 4's job retries what failed.

export const emailKind = pgEnum("email_kind", ["confirmation", "owner_slip"]);
export const emailStatus = pgEnum("email_status", [
  "pending",
  "sent",
  "failed",
]);

export const emailOutbox = pgTable(
  "email_outbox",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    kind: emailKind().notNull(),
    toAddress: text().notNull(),
    subject: text().notNull(),
    html: text().notNull(),
    text: text().notNull(),
    status: emailStatus().notNull().default("pending"),
    attempts: smallint().notNull().default(0),
    lastError: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp({ withTimezone: true }),
  },
  (t) => [unique("email_outbox_one_per_kind").on(t.orderId, t.kind)],
);

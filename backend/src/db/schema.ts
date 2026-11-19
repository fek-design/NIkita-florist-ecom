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
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
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
      "shop_settings_weekdays_valid",
      sql`cardinality(${t.deliveryWeekdays}) > 0 and ${t.deliveryWeekdays} <@ array[1,2,3,4,5,6,7]`,
    ),
  ],
);

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Tier = (typeof tier.enumValues)[number];

// Read-only queries for the storefront. Each takes the database as an
// argument, so tests can pass the test database.
import { and, asc, count, eq, gte, inArray, min } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema.js";
import { hoursAndMinutes } from "../lib/danish-time.js";

export type Db = PostgresJsDatabase<typeof schema>;

const {
  occasions,
  occasionTiers,
  occasionPhotos,
  deliveryPostcodes,
  closedDates,
  shopSettings,
} = schema;

/** An occasion is only offered when all three tiers exist (spec). */
const TIERS_REQUIRED = 3;

export type OccasionSummary = {
  slug: string;
  name: string;
  intro: string;
  fromPriceOere: number;
  soldOut: boolean;
  placeholder: boolean;
  mainPhoto: { url: string; alt: string } | null;
};

/** Visible, complete occasions in the owner's order. */
export async function listOccasions(db: Db): Promise<OccasionSummary[]> {
  const rows = await db
    .select({
      id: occasions.id,
      slug: occasions.slug,
      name: occasions.name,
      intro: occasions.intro,
      soldOut: occasions.isSoldOut,
      placeholder: occasions.isPlaceholder,
      fromPriceOere: min(occasionTiers.priceOere),
      tierCount: count(occasionTiers.tier),
    })
    .from(occasions)
    .innerJoin(occasionTiers, eq(occasionTiers.occasionId, occasions.id))
    .where(eq(occasions.isVisible, true))
    .groupBy(occasions.id)
    .orderBy(asc(occasions.sortOrder), asc(occasions.name));

  const complete = rows.filter((r) => r.tierCount === TIERS_REQUIRED);
  const mainPhotos = await firstMainPhotos(
    db,
    complete.map((r) => r.id),
  );

  return complete.map((r) => ({
    slug: r.slug,
    name: r.name,
    intro: r.intro,
    fromPriceOere: r.fromPriceOere!,
    soldOut: r.soldOut,
    placeholder: r.placeholder,
    mainPhoto: mainPhotos.get(r.id) ?? null,
  }));
}

async function firstMainPhotos(db: Db, occasionIds: number[]) {
  const result = new Map<number, { url: string; alt: string }>();
  if (occasionIds.length === 0) return result;
  const photos = await db
    .select({
      occasionId: occasionPhotos.occasionId,
      url: occasionPhotos.url,
      alt: occasionPhotos.alt,
    })
    .from(occasionPhotos)
    .where(
      and(
        inArray(occasionPhotos.occasionId, occasionIds),
        eq(occasionPhotos.role, "main"),
      ),
    )
    .orderBy(asc(occasionPhotos.sortOrder), asc(occasionPhotos.id));
  for (const p of photos) {
    if (!result.has(p.occasionId)) {
      result.set(p.occasionId, { url: p.url, alt: p.alt });
    }
  }
  return result;
}

export type OccasionDetail = {
  slug: string;
  name: string;
  intro: string;
  description: string;
  soldOut: boolean;
  placeholder: boolean;
  tiers: {
    tier: schema.Tier;
    priceOere: number;
    sizeText: string;
    placeholder: boolean;
  }[];
  photos: { url: string; alt: string; role: "main" | "scale" | "detail" }[];
};

/** One visible, complete occasion, or null (the route answers 404). */
export async function getOccasion(
  db: Db,
  slug: string,
): Promise<OccasionDetail | null> {
  const [occasion] = await db
    .select()
    .from(occasions)
    .where(and(eq(occasions.slug, slug), eq(occasions.isVisible, true)));
  if (!occasion) return null;

  // Enum order: lille, mellem, stor.
  const tiers = await db
    .select({
      tier: occasionTiers.tier,
      priceOere: occasionTiers.priceOere,
      sizeText: occasionTiers.sizeText,
      placeholder: occasionTiers.isPlaceholder,
    })
    .from(occasionTiers)
    .where(eq(occasionTiers.occasionId, occasion.id))
    .orderBy(asc(occasionTiers.tier));
  if (tiers.length !== TIERS_REQUIRED) return null;

  // Enum order puts main first, then scale, then detail.
  const photos = await db
    .select({
      url: occasionPhotos.url,
      alt: occasionPhotos.alt,
      role: occasionPhotos.role,
    })
    .from(occasionPhotos)
    .where(eq(occasionPhotos.occasionId, occasion.id))
    .orderBy(
      asc(occasionPhotos.role),
      asc(occasionPhotos.sortOrder),
      asc(occasionPhotos.id),
    );

  return {
    slug: occasion.slug,
    name: occasion.name,
    intro: occasion.intro,
    description: occasion.description,
    soldOut: occasion.isSoldOut,
    placeholder: occasion.isPlaceholder,
    tiers,
    photos,
  };
}

export type DeliveryRules = {
  deliveryFeeOere: number;
  sameDayCutoff: string;
  deliveryWeekdays: number[];
  closedDates: { date: string; reason: string }[];
  pickupEnabled: boolean;
  /** Price of a card per bouquet, shown before adding (P3). */
  cardPriceOere: number;
  openingHours: Partial<Record<schema.Weekday, [string, string]>>;
  placeholder: boolean;
};

/** Public delivery rules; closed dates from `today` (Danish date) on. */
export async function getDeliveryRules(
  db: Db,
  today: string,
): Promise<DeliveryRules | null> {
  const [settings] = await db.select().from(shopSettings);
  if (!settings) return null;
  const closed = await db
    .select({ date: closedDates.date, reason: closedDates.reason })
    .from(closedDates)
    .where(gte(closedDates.date, today))
    .orderBy(asc(closedDates.date));
  return {
    deliveryFeeOere: settings.deliveryFeeOere,
    sameDayCutoff: hoursAndMinutes(settings.sameDayCutoff),
    deliveryWeekdays: [...settings.deliveryWeekdays].sort((a, b) => a - b),
    closedDates: closed,
    pickupEnabled: settings.pickupEnabled,
    cardPriceOere: settings.cardPriceOere,
    openingHours: settings.openingHours,
    placeholder: settings.isPlaceholder,
  };
}

export type PostcodeCheck = {
  postcode: string;
  inZone: boolean;
  town: string | null;
  feeOere: number | null;
  pickupOffered: boolean;
};

/** Whether the shop delivers to a postcode, and whether pickup is offered. */
export async function checkPostcode(
  db: Db,
  postcode: string,
): Promise<PostcodeCheck | null> {
  const [settings] = await db
    .select({
      fee: shopSettings.deliveryFeeOere,
      pickup: shopSettings.pickupEnabled,
    })
    .from(shopSettings);
  if (!settings) return null;
  const [zone] = await db
    .select({ town: deliveryPostcodes.town })
    .from(deliveryPostcodes)
    .where(eq(deliveryPostcodes.postcode, postcode));
  return {
    postcode,
    inZone: Boolean(zone),
    town: zone?.town ?? null,
    feeOere: zone ? settings.fee : null,
    pickupOffered: settings.pickup,
  };
}

export type Place = { postcode: string; town: string };

/**
 * Places on the delivery list whose postcode or town starts with what was
 * typed (occasion-page-choices, spec catalog). Case-insensitive; at most
 * eight; never anything outside the list.
 */
export async function findPlaces(db: Db, query: string): Promise<Place[]> {
  const q = query.trim().toLocaleLowerCase("da-DK");
  if (!q) return [];
  const all = await db
    .select({
      postcode: deliveryPostcodes.postcode,
      town: deliveryPostcodes.town,
    })
    .from(deliveryPostcodes);
  // The list is short (the owner's zone), so it is filtered here rather
  // than in SQL, where Danish letters and case would need extra care.
  return all
    .filter(
      (p) =>
        p.postcode.startsWith(q) ||
        p.town.toLocaleLowerCase("da-DK").startsWith(q) ||
        p.town
          .toLocaleLowerCase("da-DK")
          .split(/[\s-]+/)
          .some((word) => word.startsWith(q)),
    )
    .sort((a, b) => a.postcode.localeCompare(b.postcode))
    .slice(0, 8);
}

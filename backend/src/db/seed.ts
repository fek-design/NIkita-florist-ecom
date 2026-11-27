// Placeholder catalogue from the owner interview (16 Nov 2026), marked as
// placeholders until the owner confirms each row. Text states only what the
// interview confirmed; nothing about the shop is invented (roadmap rule 6).
// Inserts use "on conflict do nothing": running the seed again never
// duplicates a row and never overwrites what the owner has changed.
import { inArray } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  deliveryPostcodes,
  occasions,
  occasionTiers,
  shopSettings,
  type Tier,
} from "./schema.js";
import type * as schema from "./schema.js";

type Db = PostgresJsDatabase<typeof schema>;

const kr = (kroner: number) => kroner * 100;

const commonDescription =
  "Vælg størrelse og leveringsdato. Vi leverer i Holbæk og omegn, og du kan også hente buketten i butikken.";

/** Prices from the interview: base 250/350/500 kr., about ±50 per occasion. */
export const seedOccasions: {
  slug: string;
  name: string;
  intro: string;
  prices: Record<Tier, number>;
  /** Set where the position must not follow the list (added later). */
  sortOrder?: number;
}[] = [
  {
    slug: "fodselsdag",
    name: "Fødselsdag",
    intro: "Buketter til fødselsdagen i tre størrelser.",
    prices: { lille: 250, mellem: 350, stor: 500 },
  },
  {
    slug: "bisaettelse",
    name: "Bisættelse",
    intro: "Blomster til bisættelse og begravelse i tre størrelser.",
    prices: { lille: 300, mellem: 400, stor: 550 },
  },
  {
    slug: "bare-fordi",
    name: "Bare fordi",
    intro: "En buket uden særlig anledning, i tre størrelser.",
    prices: { lille: 200, mellem: 300, stor: 450 },
  },
  {
    slug: "kaerlighed",
    name: "Kærlighed",
    intro: "Buketter til en, du holder af, i tre størrelser.",
    prices: { lille: 250, mellem: 350, stor: 500 },
  },
  {
    slug: "tak",
    name: "Tak",
    intro: "En buket som tak, i tre størrelser.",
    prices: { lille: 250, mellem: 350, stor: 500 },
  },
  // Added 27 Nov (Felix): the season's recommendation for December, first in
  // the owner's order so the front page features it (DD-04 fallback) until
  // she can choose in the back office (DD-23). Base prices, a placeholder.
  {
    slug: "jul-og-advent",
    name: "Jul og advent",
    intro: "Buketter til jul og advent i tre størrelser.",
    prices: { lille: 250, mellem: 350, stor: 500 },
    sortOrder: 5,
  },
];

const sizeText: Record<Tier, string> = {
  lille: "Lille buket",
  mellem: "Mellem buket",
  stor: "Stor buket",
};

/** Draft zone from the interview follow-up: about 20–30 minutes from Holbæk. */
export const seedPostcodes: [string, string][] = [
  ["4300", "Holbæk"],
  ["4390", "Vipperød"],
  ["4340", "Tølløse"],
  ["4350", "Ugerløse"],
  ["4360", "Kirke Eskilstrup"],
  ["4370", "Store Merløse"],
  ["4420", "Regstrup"],
  ["4440", "Mørkøv"],
  ["4450", "Jyderup"],
  ["4460", "Snertinge"],
  ["4520", "Svinninge"],
  ["4532", "Gislinge"],
  ["4540", "Fårevejle"],
  ["4550", "Asnæs"],
  ["4560", "Vig"],
];

export async function seed(db: Db) {
  await db
    .insert(occasions)
    .values(
      seedOccasions.map((o, i) => ({
        slug: o.slug,
        name: o.name,
        intro: o.intro,
        description: commonDescription,
        sortOrder: o.sortOrder ?? (i + 1) * 10,
      })),
    )
    .onConflictDoNothing({ target: occasions.slug });

  const rows = await db
    .select({ id: occasions.id, slug: occasions.slug })
    .from(occasions)
    .where(
      inArray(
        occasions.slug,
        seedOccasions.map((o) => o.slug),
      ),
    );
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

  await db
    .insert(occasionTiers)
    .values(
      seedOccasions.flatMap((o) =>
        (["lille", "mellem", "stor"] as const).map((tier) => ({
          occasionId: idBySlug.get(o.slug)!,
          tier,
          priceOere: kr(o.prices[tier]),
          sizeText: sizeText[tier],
        })),
      ),
    )
    .onConflictDoNothing();

  await db
    .insert(deliveryPostcodes)
    .values(seedPostcodes.map(([postcode, town]) => ({ postcode, town })))
    .onConflictDoNothing();

  await db
    .insert(shopSettings)
    .values({
      deliveryFeeOere: kr(80),
      sameDayCutoff: "12:00",
      deliveryWeekdays: [1, 2, 3, 4, 5, 6],
      dailyCapacity: 15,
      pickupEnabled: true,
      // Placeholders until the owner confirms (owner question 2).
      openingHours: {
        mon: ["10:00", "17:00"],
        tue: ["10:00", "17:00"],
        wed: ["10:00", "17:00"],
        thu: ["10:00", "17:00"],
        fri: ["10:00", "17:00"],
        sat: ["10:00", "14:00"],
      },
    })
    .onConflictDoNothing();
}

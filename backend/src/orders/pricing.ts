// Prices for an order, calculated only on the server (spec orders: "Prices
// come from the server"). The browser sends what it wants, never what it
// costs; any amount it sends is ignored because the request type has none.
import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "../catalog/queries.js";
import {
  deliveryPostcodes,
  occasions,
  occasionTiers,
  shopSettings,
  type Tier,
} from "../db/schema.js";

export const MAX_QUANTITY = 10;
export const MAX_LINES = 20;
export const MAX_CARD_MESSAGE = 200;
export const MAX_WISH = 200;

export type OrderItemRequest = {
  occasionId: number;
  tier: Tier;
  quantity: number;
  cardMessage?: string;
  /** Wishes for the bouquet (occasion-page-choices); not priced. */
  wish?: string;
};

export type PricingRequest = {
  items: OrderItemRequest[];
  fulfilment: "delivery" | "pickup";
  /** Required for delivery. */
  postcode?: string;
};

export type PricingCatalog = {
  occasions: Map<
    number,
    {
      name: string;
      isVisible: boolean;
      isSoldOut: boolean;
      prices: Partial<Record<Tier, number>>;
    }
  >;
  deliveryFeeOere: number;
  /** Added per bouquet that has a card message (the owner: 20 kr.). */
  cardPriceOere: number;
  /** Postcodes in the delivery zone (only those asked about are needed). */
  zone: Set<string>;
  pickupEnabled: boolean;
};

export type PricedLine = {
  lineNo: number;
  occasionId: number;
  occasionName: string;
  tier: Tier;
  quantity: number;
  unitPriceOere: number;
  cardMessage: string;
  /** Per bouquet, so the line pays it times its quantity; 0 without a card. */
  cardPriceOere: number;
  wish: string;
};

/** Why an order cannot be priced; the route turns these into Danish text. */
export type PricingProblem =
  | { code: "empty" }
  | { code: "too_many_lines" }
  | { code: "bad_quantity"; line: number }
  | { code: "unknown_occasion"; line: number }
  | { code: "sold_out"; line: number }
  | { code: "unknown_tier"; line: number }
  | { code: "card_message_too_long"; line: number }
  | { code: "wish_too_long"; line: number }
  | { code: "postcode_missing" }
  | { code: "outside_zone"; postcode: string }
  | { code: "pickup_off" };

export type PricingResult =
  | {
      ok: true;
      lines: PricedLine[];
      deliveryFeeOere: number;
      totalOere: number;
    }
  | { ok: false; problems: PricingProblem[] };

/** Prices an order from catalogue data. Pure: no database, no clock. */
export function priceOrder(
  request: PricingRequest,
  catalog: PricingCatalog,
): PricingResult {
  const problems: PricingProblem[] = [];
  const lines: PricedLine[] = [];

  if (request.items.length === 0) problems.push({ code: "empty" });
  if (request.items.length > MAX_LINES)
    problems.push({ code: "too_many_lines" });

  request.items.forEach((item, index) => {
    const line = index + 1;
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY
    ) {
      problems.push({ code: "bad_quantity", line });
    }
    const cardMessage = (item.cardMessage ?? "").trim();
    if (cardMessage.length > MAX_CARD_MESSAGE) {
      problems.push({ code: "card_message_too_long", line });
    }
    const wish = (item.wish ?? "").trim();
    if (wish.length > MAX_WISH) {
      problems.push({ code: "wish_too_long", line });
    }
    const occasion = catalog.occasions.get(item.occasionId);
    if (!occasion || !occasion.isVisible) {
      problems.push({ code: "unknown_occasion", line });
      return;
    }
    if (occasion.isSoldOut) {
      problems.push({ code: "sold_out", line });
      return;
    }
    const price = occasion.prices[item.tier];
    if (price === undefined) {
      problems.push({ code: "unknown_tier", line });
      return;
    }
    lines.push({
      lineNo: line,
      occasionId: item.occasionId,
      occasionName: occasion.name,
      tier: item.tier,
      quantity: item.quantity,
      unitPriceOere: price,
      cardMessage,
      cardPriceOere: cardMessage ? catalog.cardPriceOere : 0,
      wish,
    });
  });

  let deliveryFeeOere = 0;
  if (request.fulfilment === "delivery") {
    const postcode = request.postcode?.trim();
    if (!postcode) {
      problems.push({ code: "postcode_missing" });
    } else if (!catalog.zone.has(postcode)) {
      problems.push({ code: "outside_zone", postcode });
    } else {
      // One delivery per order, so one fee (P3: shown before checkout).
      deliveryFeeOere = catalog.deliveryFeeOere;
    }
  } else if (!catalog.pickupEnabled) {
    problems.push({ code: "pickup_off" });
  }

  if (problems.length > 0) return { ok: false, problems };

  // A card is charged per bouquet: times the quantity, like the bouquet.
  const goods = lines.reduce(
    (sum, l) => sum + (l.unitPriceOere + l.cardPriceOere) * l.quantity,
    0,
  );
  return {
    ok: true,
    lines,
    deliveryFeeOere,
    totalOere: goods + deliveryFeeOere,
  };
}

/** Loads only the catalogue data an order needs. */
export async function loadPricingCatalog(
  db: Db,
  request: PricingRequest,
): Promise<PricingCatalog | null> {
  const [settings] = await db
    .select({
      fee: shopSettings.deliveryFeeOere,
      card: shopSettings.cardPriceOere,
      pickup: shopSettings.pickupEnabled,
    })
    .from(shopSettings);
  if (!settings) return null;

  const ids = [...new Set(request.items.map((i) => i.occasionId))].filter(
    (id) => Number.isInteger(id),
  );
  const rows =
    ids.length === 0
      ? []
      : await db
          .select({
            id: occasions.id,
            name: occasions.name,
            isVisible: occasions.isVisible,
            isSoldOut: occasions.isSoldOut,
            tier: occasionTiers.tier,
            price: occasionTiers.priceOere,
          })
          .from(occasions)
          .leftJoin(occasionTiers, eq(occasionTiers.occasionId, occasions.id))
          .where(inArray(occasions.id, ids));

  const catalogOccasions: PricingCatalog["occasions"] = new Map();
  for (const row of rows) {
    const entry = catalogOccasions.get(row.id) ?? {
      name: row.name,
      isVisible: row.isVisible,
      isSoldOut: row.isSoldOut,
      prices: {},
    };
    if (row.tier && row.price !== null) entry.prices[row.tier] = row.price;
    catalogOccasions.set(row.id, entry);
  }

  const zone = new Set<string>();
  const postcode = request.postcode?.trim();
  if (request.fulfilment === "delivery" && postcode) {
    const [inZone] = await db
      .select({ postcode: deliveryPostcodes.postcode })
      .from(deliveryPostcodes)
      .where(and(eq(deliveryPostcodes.postcode, postcode)));
    if (inZone) zone.add(postcode);
  }

  return {
    occasions: catalogOccasions,
    deliveryFeeOere: settings.fee,
    cardPriceOere: settings.card,
    zone,
    pickupEnabled: settings.pickup,
  };
}

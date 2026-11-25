import { cacheLife } from "next/cache";
import { backendFetch } from "@/lib/backend";

export type OccasionSummary = {
  slug: string;
  name: string;
  intro: string;
  fromPriceOere: number;
  soldOut: boolean;
  placeholder: boolean;
  mainPhoto: { url: string; alt: string } | null;
};

export type OccasionLink = { slug: string; name: string };

/**
 * Visible occasions in the owner's order. Cached for minutes; if the backend
 * cannot be reached (as when CI builds without one), an empty list, so the
 * pages still render.
 */
export async function getOccasions(): Promise<OccasionSummary[]> {
  "use cache";
  cacheLife("minutes");
  try {
    const res = await backendFetch("/occasions");
    if (!res.ok) return [];
    return ((await res.json()) as { occasions: OccasionSummary[] }).occasions;
  } catch {
    return [];
  }
}

/** The occasions for the menu. */
export async function getOccasionLinks(): Promise<OccasionLink[]> {
  return (await getOccasions()).map(({ slug, name }) => ({ slug, name }));
}

export type Tier = "lille" | "mellem" | "stor";

export type OccasionDetail = {
  slug: string;
  name: string;
  intro: string;
  description: string;
  soldOut: boolean;
  placeholder: boolean;
  tiers: {
    tier: Tier;
    priceOere: number;
    sizeText: string;
    placeholder: boolean;
  }[];
  photos: { url: string; alt: string; role: "main" | "scale" | "detail" }[];
};

/** One occasion, or null when it does not exist or is hidden (404). */
export async function getOccasion(
  slug: string,
): Promise<OccasionDetail | null> {
  "use cache";
  cacheLife("minutes");
  try {
    const res = await backendFetch(`/occasions/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    return (await res.json()) as OccasionDetail;
  } catch {
    return null;
  }
}

export type DeliveryRules = {
  deliveryFeeOere: number;
  sameDayCutoff: string;
  deliveryWeekdays: number[];
  pickupEnabled: boolean;
  placeholder: boolean;
};

export async function getDeliveryRules(): Promise<DeliveryRules | null> {
  "use cache";
  cacheLife("minutes");
  try {
    const res = await backendFetch("/delivery");
    if (!res.ok) return null;
    return (await res.json()) as DeliveryRules;
  } catch {
    return null;
  }
}

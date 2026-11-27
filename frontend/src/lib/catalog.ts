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
 * Visible occasions in the owner's order, cached for minutes. If the backend
 * cannot be reached (as when CI builds without one), an empty list, so the
 * pages still render. The failure itself is never cached: the cached part
 * throws, and only a real answer is kept, so the products come back as soon
 * as the backend does.
 */
export async function getOccasions(): Promise<OccasionSummary[]> {
  try {
    return await fetchOccasions();
  } catch {
    return [];
  }
}

async function fetchOccasions(): Promise<OccasionSummary[]> {
  "use cache";
  cacheLife("minutes");
  const res = await backendFetch("/occasions");
  if (!res.ok) throw new Error(`occasions: ${res.status}`);
  return ((await res.json()) as { occasions: OccasionSummary[] }).occasions;
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

/**
 * One occasion, or null when it does not exist or is hidden (404). When the
 * backend cannot be reached this throws instead, so a real bouquet never
 * shows "not found" (and the error is not cached).
 */
export async function getOccasion(
  slug: string,
): Promise<OccasionDetail | null> {
  "use cache";
  cacheLife("minutes");
  const res = await backendFetch(`/occasions/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`occasion ${slug}: ${res.status}`);
  return (await res.json()) as OccasionDetail;
}

export type DeliveryRules = {
  deliveryFeeOere: number;
  sameDayCutoff: string;
  deliveryWeekdays: number[];
  pickupEnabled: boolean;
  placeholder: boolean;
};

/** The delivery facts, or null without a backend; a failure is not cached. */
export async function getDeliveryRules(): Promise<DeliveryRules | null> {
  try {
    return await fetchDeliveryRules();
  } catch {
    return null;
  }
}

async function fetchDeliveryRules(): Promise<DeliveryRules> {
  "use cache";
  cacheLife("minutes");
  const res = await backendFetch("/delivery");
  if (!res.ok) throw new Error(`delivery: ${res.status}`);
  return (await res.json()) as DeliveryRules;
}

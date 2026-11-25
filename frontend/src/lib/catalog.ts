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

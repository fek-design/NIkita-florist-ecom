import { cacheLife } from "next/cache";
import { backendFetch } from "@/lib/backend";

export type OccasionLink = { slug: string; name: string };

/**
 * The occasions for the menu. Cached for minutes; if the backend cannot be
 * reached (as when CI builds without one), the menu still works with only
 * "Se alle anledninger".
 */
export async function getOccasionLinks(): Promise<OccasionLink[]> {
  "use cache";
  cacheLife("minutes");
  try {
    const res = await backendFetch("/occasions");
    if (!res.ok) return [];
    const body = (await res.json()) as { occasions: OccasionLink[] };
    return body.occasions.map(({ slug, name }) => ({ slug, name }));
  } catch {
    return [];
  }
}

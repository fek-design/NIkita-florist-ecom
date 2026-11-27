import type { MetadataRoute } from "next";
import { getOccasions } from "@/lib/catalog";
import { siteUrl } from "@/env";

/**
 * Spec storefront "Findable pages": the front page, the category page and
 * every visible occasion page. Not the cart, checkout, orders or status.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const occasions = await getOccasions();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/anledninger`, changeFrequency: "weekly", priority: 0.8 },
    ...occasions.map((o) => ({
      url: `${base}/anledning/${o.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

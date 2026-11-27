import type { MetadataRoute } from "next";
import { siteUrl } from "@/env";

/**
 * Search engines and AI crawlers are welcome (spec storefront, roadmap GEO);
 * the cart, checkout, orders and status page hold nothing to index.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/kurv", "/betaling", "/ordre/", "/status"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

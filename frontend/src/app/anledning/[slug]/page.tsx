import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderForm } from "@/components/order-form";
import { Photo } from "@/components/photo";
import { getDeliveryRules, getOccasion } from "@/lib/catalog";
import { standInFor } from "@/lib/stand-ins";
import { siteUrl } from "@/env";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/anledning/[slug]">): Promise<Metadata> {
  const occasion = await getOccasion((await params).slug);
  if (!occasion) return { title: "Siden findes ikke · Nikita Nielsen" };
  return {
    title: `${occasion.name} · Nikita Nielsen`,
    description: `${occasion.intro} Levering i Holbæk og omegn, eller hent i butikken i Tuse.`,
  };
}

/**
 * The occasion page (hi-fi S4): photo, name, intro, then the choices. The
 * address is only known per request, so the content streams in behind a
 * skeleton of the same shape (Cache Components, DD-26).
 */
export default function OccasionPage({
  params,
}: PageProps<"/anledning/[slug]">) {
  return (
    <Suspense fallback={<Skeleton />}>
      {params.then(({ slug }) => (
        <Occasion slug={slug} />
      ))}
    </Suspense>
  );
}

async function Occasion({ slug }: { slug: string }) {
  const [occasion, rules] = await Promise.all([
    getOccasion(slug),
    getDeliveryRules(),
  ]);
  if (!occasion) notFound();
  const own = occasion.photos.find((p) => p.role === "main");
  const main = own ?? standInFor(slug);
  return (
    <article className={styles.page}>
      <ProductData occasion={occasion} image={own?.url ?? null} />
      <Photo photo={main} ratio={4 / 5} sizes="100vw" priority />
      <div className={styles.title}>
        <h1>{occasion.name}</h1>
        <p className="muted">
          {occasion.intro}
          {occasion.placeholder && <em> · Eksempel</em>}
        </p>
        {occasion.soldOut && <p className={styles.soldOut}>Udsolgt lige nu</p>}
      </div>
      <OrderForm occasion={occasion} rules={rules} />
    </article>
  );
}

function Skeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Henter buketten">
      <Photo photo={null} ratio={4 / 5} sizes="100vw" />
    </div>
  );
}

/**
 * Product data for search engines and AI tools (spec: "Product data", P10):
 * the price range across the tiers in DKK. Only the owner's own photo is
 * named, never a stand-in, and no business details until they are real.
 */
function ProductData({
  occasion,
  image,
}: {
  occasion: NonNullable<Awaited<ReturnType<typeof getOccasion>>>;
  image: string | null;
}) {
  const prices = occasion.tiers.map((t) => t.priceOere / 100);
  const url = `${siteUrl()}/anledning/${occasion.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: occasion.name,
    description: occasion.intro,
    url,
    ...(image ? { image: new URL(image, siteUrl()).href } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "DKK",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: occasion.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url,
    },
  };
  return (
    <script
      type="application/ld+json"
      // JSON from our own catalogue; "<" escaped so text cannot end the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

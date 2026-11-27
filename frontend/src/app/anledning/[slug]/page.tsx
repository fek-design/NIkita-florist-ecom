import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderForm } from "@/components/order-form";
import { Photo } from "@/components/photo";
import { getDeliveryRules, getOccasion } from "@/lib/catalog";
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
  const main = occasion.photos.find((p) => p.role === "main") ?? null;
  return (
    <article className={styles.page}>
      <div className={styles.photo}>
        <Photo
          photo={main}
          ratio={4 / 5}
          sizes="(max-width: 600px) 100vw, 600px"
          priority
        />
      </div>
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
      <div className={styles.photo}>
        <Photo photo={null} ratio={4 / 5} sizes="100vw" />
      </div>
    </div>
  );
}

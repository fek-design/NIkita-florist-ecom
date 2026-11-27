import type { Metadata } from "next";
import Link from "next/link";
import { MapTrifoldIcon } from "@/components/icons";
import { OccasionCard } from "@/components/occasion-card";
import { Photo } from "@/components/photo";
import { getOccasions } from "@/lib/catalog";
import { kroner } from "@/lib/format";
import { SHOP } from "@/lib/shop";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Nikita Nielsen · Blomster fra Tuse",
  description:
    "Håndbundne buketter fra Nikitas værksted i Tuse. Levering i Holbæk og omegn, eller hent selv i butikken.",
};

/**
 * Front page, built from Felix's design (DD-01) as hi-fi v2 S1: hero, the
 * line into the recommendation (DD-22), the featured bouquet (DD-04), the
 * top four occasions (DD-13), "Se alle", and "Besøg Nikita".
 */
export default async function Home() {
  const occasions = await getOccasions();
  // Until the owner can choose one (DD-23, back office) and until there are
  // orders to rank by, the owner's order stands in (DD-04, DD-13).
  const featured = occasions[0];
  const topFour = occasions.slice(0, 4);
  const address = `${SHOP.street}, ${SHOP.postcode} ${SHOP.town}`;

  return (
    <>
      <div className={styles.hero}>
        <Photo photo={null} ratio={6 / 5} sizes="100vw" priority />
      </div>

      <section className={styles.featured} aria-labelledby="anbefaling">
        {/* The page's main heading for search engines (P10), styled as the
            plain intro line of the design. */}
        <h1 className={styles.intro}>
          Håndbundne buketter fra Nikitas værksted i Tuse. Lige nu anbefaler
          hun:
        </h1>
        {featured && (
          <>
            <h2 id="anbefaling" className={styles.featuredName}>
              {featured.name}
            </h2>
            <p className="muted">
              {featured.intro}
              {featured.placeholder && <em> · Eksempel</em>}
            </p>
            <Link
              href={`/anledning/${featured.slug}`}
              className={styles.primary}
            >
              Se fra {kroner(featured.fromPriceOere)}
            </Link>
          </>
        )}
      </section>

      <section className={styles.occasions} aria-labelledby="anledninger">
        <h2 id="anledninger">Hvad betyder blomsterne for dig?</h2>
        <ul className={styles.grid}>
          {topFour.map((occasion) => (
            <li key={occasion.slug}>
              <OccasionCard occasion={occasion} />
            </li>
          ))}
        </ul>
        <Link href="/anledninger" className={styles.secondary}>
          Se alle
        </Link>
      </section>

      <section
        className={styles.visit}
        id="besoeg"
        aria-labelledby="besoeg-titel"
      >
        <div className={styles.visitPhoto}>
          <Photo photo={null} ratio={168 / 198} sizes="45vw" />
        </div>
        <div className={styles.visitText}>
          <h2 id="besoeg-titel">Besøg Nikita</h2>
          <p className="muted">
            Uddannet blomsterdekoratør, med værksted. Jeg laver alt i binderi,
            kun fantasien sætter grænser. Kontakt mig gerne for inspiration og
            ideer.
          </p>
          <a
            className={styles.address}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          >
            <MapTrifoldIcon />
            <span>
              {SHOP.street}
              <br />
              {SHOP.postcode} {SHOP.town}
            </span>
          </a>
        </div>
      </section>
    </>
  );
}

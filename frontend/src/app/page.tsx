import type { Metadata } from "next";
import Link from "next/link";
import { MapTrifoldIcon } from "@/components/icons";
import { OccasionCard } from "@/components/occasion-card";
import { Photo } from "@/components/photo";
import { getDeliveryRules, getOccasions } from "@/lib/catalog";
import { kroner } from "@/lib/format";
import { openingHoursInWords } from "@/lib/opening-hours";
import { SHOP } from "@/lib/shop";
import { HERO_STAND_IN, VISIT_STAND_IN } from "@/lib/stand-ins";
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
  const [occasions, rules] = await Promise.all([
    getOccasions(),
    getDeliveryRules(),
  ]);
  // Until the owner can choose one (DD-23, back office) and until there are
  // orders to rank by, the owner's order stands in (DD-04, DD-13).
  const featured = occasions[0];
  const topFour = occasions.slice(0, 4);
  const address = `${SHOP.street}, ${SHOP.postcode} ${SHOP.town}`;

  return (
    <>
      <div className={styles.hero}>
        <Photo photo={HERO_STAND_IN} ratio={6 / 5} sizes="100vw" priority />
      </div>

      <section className={styles.featured} aria-labelledby="anbefaling">
        {/* The page's main heading for search engines (P10), a quiet line of
            its own; the recommendation is a separate group below (DD-38). */}
        <h1 className={styles.intro}>
          Håndbundne buketter fra Nikitas værksted i Tuse.
        </h1>
        {featured && (
          <div className={styles.pick}>
            <p className={styles.label}>Månedens buket</p>
            <h2 id="anbefaling" className={styles.featuredName}>
              {featured.name}
            </h2>
            <Link
              href={`/anledning/${featured.slug}`}
              className={styles.primary}
            >
              Se fra {kroner(featured.fromPriceOere)}
            </Link>
          </div>
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
          <Photo photo={VISIT_STAND_IN} ratio={168 / 198} sizes="45vw" />
        </div>
        <div className={styles.visitText}>
          <h2 id="besoeg-titel">Besøg Nikita</h2>
          <p className="muted">
            Uddannet blomsterdekoratør, med værksted. Jeg laver alt i binderi,
            kun fantasien sætter grænser. Kontakt mig gerne for inspiration og
            ideer.
          </p>
        </div>
        {/* More about the shop (Felix, 27 Nov, DD-34): only facts the shop
            has given, then the address on one line and the opening hours
            from the back office. The map was tried and taken out the same
            day (too bulky). */}
        <div className={styles.visitMore}>
          <p className="muted">
            Butikken og værkstedet ligger i Tuse, lidt uden for Holbæk. Her kan
            du hente din bestilling på det tidspunkt, du har valgt, eller ringe
            på <a href={SHOP.phoneHref}>{SHOP.phone}</a> og høre om en buket til
            en særlig lejlighed.
          </p>
          <a
            className={styles.address}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          >
            <MapTrifoldIcon />
            <span>{address}</span>
          </a>
          {rules && Object.keys(rules.openingHours).length > 0 && (
            <p>
              <strong>Åbent</strong> {openingHoursInWords(rules.openingHours)}
              {rules.placeholder && <em className="muted"> · Eksempel</em>}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

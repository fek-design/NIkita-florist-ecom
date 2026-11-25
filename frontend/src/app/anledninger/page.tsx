import type { Metadata } from "next";
import { OccasionCard } from "@/components/occasion-card";
import { getOccasions } from "@/lib/catalog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Anledninger · Nikita Nielsen",
  description:
    "Buketter til fødselsdag, bisættelse, kærlighed, tak og bare fordi. Hver buket i tre størrelser, med prisen vist før du vælger.",
};

/** Every visible occasion (hi-fi S3, DD-13), in the owner's order. */
export default async function OccasionsPage() {
  const occasions = await getOccasions();
  return (
    <div className={styles.page}>
      <h1>Anledninger</h1>
      <p className="muted">
        Vælg anledningen. Hver buket findes i tre størrelser, og du ser prisen,
        før du vælger.
      </p>
      <ul className={styles.grid}>
        {occasions.map((occasion) => (
          <li key={occasion.slug}>
            <OccasionCard occasion={occasion} />
          </li>
        ))}
      </ul>
    </div>
  );
}

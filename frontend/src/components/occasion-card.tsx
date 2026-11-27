import Link from "next/link";
import { Photo } from "@/components/photo";
import { kroner } from "@/lib/format";
import type { OccasionSummary } from "@/lib/catalog";
import styles from "./occasion-card.module.css";

/** An occasion in the grid (S1, S3): photo, name, lowest price. */
export function OccasionCard({ occasion }: { occasion: OccasionSummary }) {
  return (
    <Link href={`/anledning/${occasion.slug}`} className={styles.card}>
      <Photo
        photo={occasion.mainPhoto}
        ratio={5 / 7}
        sizes="(max-width: 600px) 50vw, 360px"
      />
      <span className={styles.name}>{occasion.name}</span>
      <span className={styles.price}>
        {occasion.soldOut ? "Udsolgt" : `fra ${kroner(occasion.fromPriceOere)}`}
        {occasion.placeholder && (
          <span className={styles.example}> · Eksempel</span>
        )}
      </span>
    </Link>
  );
}

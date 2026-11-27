"use client";

// Shown when a page cannot be built, e.g. when the backend does not answer.
// Brand voice: say what happened and what to do (brand guide section 6).
import Link from "next/link";
import { SHOP } from "@/lib/shop";
import styles from "./not-found.module.css";

export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className={styles.page}>
      <h1>Siden kan ikke vises lige nu</h1>
      <p>
        Prøv igen om lidt. Haster det, så ring til Nikita på{" "}
        <a href={SHOP.phoneHref}>{SHOP.phone}</a>.
      </p>
      <button type="button" className={styles.button} onClick={() => retry()}>
        Prøv igen
      </button>
      <Link href="/">Til forsiden</Link>
    </div>
  );
}

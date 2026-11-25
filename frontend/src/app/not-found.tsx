import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1>Siden findes ikke</h1>
      <p>Måske er linket gammelt, eller der er en stavefejl i adressen.</p>
      <Link href="/anledninger" className={styles.button}>
        Se alle anledninger
      </Link>
      <Link href="/">Til forsiden</Link>
    </div>
  );
}

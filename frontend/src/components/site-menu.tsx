"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { BasketIcon, ListIcon, XIcon } from "@/components/icons";
import type { OccasionLink } from "@/lib/catalog";
import styles from "./site-menu.module.css";

/**
 * The menu (hi-fi S2): occasions first, then "Se alle" (Baymard: categories
 * as the top level, "view all" at each level), then the shop. A native
 * dialog gives focus handling and Esc to close without extra code.
 */
export function SiteMenu({ occasions }: { occasions: OccasionLink[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        className={styles.iconButton}
        aria-label="Åbn menu"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <ListIcon size={28} />
      </button>
      <dialog ref={dialog} className={styles.menu} aria-label="Menu">
        <div className={styles.top}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Luk menu"
            onClick={close}
          >
            <XIcon size={28} />
          </button>
          {/* Same bar as the navbar (S2), so the page does not jump. */}
          <Link
            href="/"
            className={styles.logo}
            onClick={close}
            aria-label="Nikita Nielsen, forsiden"
          >
            <Image
              src="/brand/logo-half-sand-110w@3x.png"
              alt=""
              width={110}
              height={57}
            />
          </Link>
          <Link
            href="/kurv"
            className={styles.iconButton}
            onClick={close}
            aria-label="Kurv"
          >
            <BasketIcon size={28} />
          </Link>
        </div>
        <nav className={styles.list} onClick={close}>
          <p className={styles.label}>Anledninger</p>
          {occasions.map((o) => (
            <Link
              key={o.slug}
              href={`/anledning/${o.slug}`}
              className={styles.row}
            >
              {o.name}
            </Link>
          ))}
          <Link
            href="/anledninger"
            className={`${styles.row} ${styles.strong}`}
          >
            Se alle anledninger
          </Link>
          <p className={styles.label}>Butikken</p>
          <Link href="/#besoeg" className={styles.row}>
            Besøg Nikita i Tuse
          </Link>
          <Link href="#kontakt" className={styles.row}>
            Kontakt
          </Link>
        </nav>
      </dialog>
    </>
  );
}

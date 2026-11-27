"use client";

// The shop on a map, loaded only when asked for (Felix chose "two-click",
// 27 Nov): Google Maps sets cookies and loads Google's scripts and fonts, so
// nothing from Google loads until the visitor taps. No cookie banner needed,
// and the page keeps its own fonts only (spec storefront).
import { useState } from "react";
import { MapTrifoldIcon } from "@/components/icons";
import styles from "./map-embed.module.css";

export function MapEmbed({ address }: { address: string }) {
  const [shown, setShown] = useState(false);
  if (shown) {
    return (
      <iframe
        className={styles.frame}
        title={`Kort over butikken, ${address}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }
  return (
    <button
      type="button"
      className={styles.placeholder}
      onClick={() => setShown(true)}
    >
      <MapTrifoldIcon size={32} />
      <span className={styles.label}>Vis kort</span>
      <span className={styles.note}>
        Kortet hentes fra Google Maps, når du trykker.
      </span>
    </button>
  );
}

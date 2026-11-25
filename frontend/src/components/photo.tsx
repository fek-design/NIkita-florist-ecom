"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./photo.module.css";

/**
 * A photo area that keeps its size while loading (DD-12: no jumps). Until
 * the photo has loaded, and where there is no owner photo yet, a light
 * skeleton wave runs over the Linen (DD-26). It stops once the photo is in;
 * with "reduce motion" the area stays plain Linen. Photos below the first
 * screen load lazily (next/image default).
 */
export function Photo({
  photo,
  ratio,
  sizes,
  priority = false,
}: {
  photo: { url: string; alt: string } | null;
  /** Width / height, e.g. 4 / 5. */
  ratio: number;
  sizes: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={styles.frame}
      style={{ aspectRatio: ratio }}
      data-loaded={loaded || undefined}
    >
      {photo ? (
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <span className={styles.coming}>Foto kommer</span>
      )}
    </div>
  );
}

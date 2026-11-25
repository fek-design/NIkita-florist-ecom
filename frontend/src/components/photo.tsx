import Image from "next/image";
import styles from "./photo.module.css";

/**
 * A photo area that keeps its size while loading (DD-12: no jumps, Linen
 * behind). Without an owner photo it says one is coming (spec: placeholder
 * content is marked). Below the first screen the photo loads lazily.
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
  return (
    <div className={styles.frame} style={{ aspectRatio: ratio }}>
      {photo ? (
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
        />
      ) : (
        <span className={styles.coming}>Foto kommer</span>
      )}
    </div>
  );
}

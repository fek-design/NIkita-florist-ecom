import Image from "next/image";
import Link from "next/link";
import { BasketIcon } from "@/components/icons";
import { CartCount, CartLabel } from "@/components/cart-count";
import { SiteMenu } from "@/components/site-menu";
import { getOccasionLinks } from "@/lib/catalog";
import styles from "./site-header.module.css";

/**
 * The navbar (hi-fi S1): menu, the half-moon logo at the brand's 110 px
 * minimum (DD-09), and the basket with its count. 72 px high so the logo
 * fits; every target 44 px.
 */
export async function SiteHeader() {
  const occasions = await getOccasionLinks();
  return (
    <header className={styles.bar}>
      <SiteMenu occasions={occasions} />
      <Link
        href="/"
        className={styles.logo}
        aria-label="Nikita Nielsen, forsiden"
      >
        <Image
          src="/brand/logo-half-sand-110w@3x.png"
          alt=""
          width={110}
          height={57}
          priority
        />
      </Link>
      <Link href="/kurv" className={styles.basket}>
        <BasketIcon size={28} />
        <CartCount />
        <CartLabel />
      </Link>
    </header>
  );
}

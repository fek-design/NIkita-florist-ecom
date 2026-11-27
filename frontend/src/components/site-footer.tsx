import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeIcon,
  FacebookLogoIcon,
  MapTrifoldIcon,
  PhoneIcon,
} from "@/components/icons";
import {
  LockIcon,
  MastercardMark,
  MobilePayMark,
  VisaMark,
} from "@/components/payment-marks";
import { SHOP } from "@/lib/shop";
import styles from "./site-footer.module.css";

/**
 * Footer C (DD-08): a Sand band, the full logo in Paper, contact as
 * full-width 48 px rows, then CVR, the legal links (CLAUDE.md override 1)
 * and the payment methods (DD-22).
 */
export function SiteFooter() {
  const address = `${SHOP.street}, ${SHOP.postcode} ${SHOP.town}`;
  return (
    <footer className={styles.footer} id="kontakt">
      <Image
        src="/brand/logo-full-paper-160w@3x.png"
        alt="Nikita Nielsen"
        width={120}
        height={105}
        className={styles.logo}
      />
      <h2 className={styles.heading}>Kontakt</h2>
      <ul className={styles.list}>
        <li>
          <a className={styles.row} href={`mailto:${SHOP.email}`}>
            <EnvelopeIcon /> {SHOP.email}
          </a>
        </li>
        <li>
          <a className={styles.row} href={SHOP.phoneHref}>
            <PhoneIcon /> {SHOP.phone}
          </a>
        </li>
        <li>
          <a
            className={styles.row}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          >
            <MapTrifoldIcon /> {address}
          </a>
        </li>
        <li>
          {SHOP.facebookUrl ? (
            <a className={styles.row} href={SHOP.facebookUrl}>
              <FacebookLogoIcon /> Facebook
            </a>
          ) : (
            <span className={styles.row}>
              <FacebookLogoIcon /> Facebook{" "}
              <span className={styles.placeholder}>(link følger)</span>
            </span>
          )}
        </li>
      </ul>
      <div className={styles.legal}>
        <p>
          {SHOP.cvr ? (
            `CVR-nr. ${SHOP.cvr}`
          ) : (
            <>
              CVR-nr. <span className={styles.placeholder}>(følger)</span>
            </>
          )}
        </p>
        <p className={styles.links}>
          <Link href="/handelsbetingelser">Handelsbetingelser</Link>
          <Link href="/privatlivspolitik">Privatlivspolitik</Link>
        </p>
      </div>
      {/* Secure payment and the methods (Felix, 27 Nov). "Sikker betaling",
          not "100 %": no absolute claims (brand voice, marketing law). */}
      <div className={styles.payment}>
        <p className={styles.secure}>
          <LockIcon /> Sikker betaling
        </p>
        <p className={styles.marks}>
          <MobilePayMark />
          <VisaMark />
          <MastercardMark />
        </p>
        <p className={styles.methods}>
          MobilePay, Visa/Dankort og Mastercard. Kortoplysninger håndteres af
          Stripe og kommer aldrig forbi butikken.
        </p>
      </div>
    </footer>
  );
}

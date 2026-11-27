import type { Metadata } from "next";
import { siteUrl } from "@/env";
import localFont from "next/font/local";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Brand fonts, self-hosted subsets from ref/brand/fonts (no requests to
// Google; P7 and GDPR). Both are variable fonts limited to weights 400–700.
const ancizarSerif = localFont({
  src: "./fonts/ancizar-serif.woff2",
  weight: "400 700",
  variable: "--font-ancizar-serif",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter.woff2",
  weight: "400 700",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Nikita Nielsen",
  description: "Blomster til enhver anledning, leveret i Holbæk og omegn.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="da" className={`${ancizarSerif.variable} ${inter.variable}`}>
      <body>
        <a href="#indhold" className="skip-link">
          Gå til indhold
        </a>
        <SiteHeader />
        <main id="indhold">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

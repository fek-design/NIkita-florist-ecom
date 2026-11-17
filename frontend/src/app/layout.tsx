import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nikita Nielsen",
  description: "Blomster til enhver anledning, leveret i Holbæk og omegn.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}

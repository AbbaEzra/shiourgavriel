import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const display = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shiourgavriel.com"),
  title: {
    default: "Shiour Gavriel — Cours particuliers de mathématiques",
    template: "%s — Shiour Gavriel",
  },
  description:
    "Cours particuliers de mathématiques, collège et lycée, avec Gabriel Krief. À domicile ou par Zoom. Réservez votre créneau en ligne.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-sg-cream font-body text-sg-ink antialiased">{children}</body>
    </html>
  );
}

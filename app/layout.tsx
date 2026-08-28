import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

// Rubik : une seule famille de police pour tout le site, support natif
// latin + hébreu (évite d'avoir deux polices différentes selon la langue).
const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
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

// Fixe lang/dir sur <html> avant le premier rendu, selon le préfixe de langue de
// l'URL (/he/... → rtl). Export statique = pas de rendu serveur par route, donc ce
// petit script synchrone (avant paint) est la façon fiable d'éviter tout flash LTR/RTL.
const BOOTSTRAP_LANG = `
(function () {
  var seg = location.pathname.split("/").filter(Boolean)[0];
  var he = seg === "he";
  document.documentElement.lang = he ? "he" : "fr";
  document.documentElement.dir = he ? "rtl" : "ltr";
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={rubik.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_LANG }} />
      </head>
      <body className="bg-sg-cream font-body text-sg-ink antialiased">{children}</body>
    </html>
  );
}

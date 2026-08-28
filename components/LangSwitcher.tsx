"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/dictionaries";

const LABELS: Record<Locale, { flag: string; nom: string }> = {
  fr: { flag: "🇫🇷", nom: "Français" },
  he: { flag: "🇮🇱", nom: "עברית" },
};

/** Remplace le segment de langue en tête du chemin courant (/fr/reserver → /he/reserver). */
function chemin(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  segments[0] = locale;
  return `/${segments.join("/")}/`;
}

export function LangSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-haspopup="true"
        className="flex items-center gap-1.5 rounded-sg-pill border border-sg-border bg-white px-3 py-1.5 text-[13px] font-semibold text-sg-ink"
      >
        <span aria-hidden="true">{LABELS[locale].flag}</span>
        {LABELS[locale].nom}
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {ouvert && (
        <div className="absolute end-0 top-[calc(100%+6px)] z-50 min-w-[140px] rounded-sg-md border border-sg-border bg-white p-1.5 shadow-sg-card">
          {LOCALES.map((l) => (
            <a
              key={l}
              href={chemin(pathname, l)}
              className={`flex items-center gap-2 rounded-sg-sm px-2.5 py-2 text-[13.5px] font-semibold ${
                l === locale ? "bg-sg-cream text-sg-navy" : "text-sg-ink hover:bg-sg-cream"
              }`}
            >
              <span aria-hidden="true">{LABELS[l].flag}</span>
              {LABELS[l].nom}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

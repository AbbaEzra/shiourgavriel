import type { Metadata } from "next";
import Link from "next/link";
import { LangSwitcher } from "@/components/LangSwitcher";
import { getDictionary, LOCALES, type Locale } from "@/lib/dictionaries";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const dict = getDictionary(params.locale as Locale);
  return {
    title: `${dict.home.titre1} ${dict.home.titre2}`,
    description: dict.home.sousTitre,
  };
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);
  const t = dict.home;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sg-border bg-sg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-sg-container items-center justify-between px-sg-gutter py-4">
          <span className="font-display text-[20px] font-extrabold tracking-[-.3px] text-sg-navy">
            {dict.siteName}
          </span>
          <div className="flex items-center gap-3.5">
            <LangSwitcher locale={locale} />
            <Link href={`/${locale}/connexion/`} className="hidden text-[13.5px] font-semibold text-sg-navy underline sm:inline">
              {dict.nav.connexion}
            </Link>
            <Link
              href={`/${locale}/reserver/`}
              className="rounded-sg-pill bg-sg-gold px-5 py-2.5 text-[14px] font-bold text-sg-gold-ink shadow-sg-cta transition hover:-translate-y-px"
            >
              {dict.nav.reserver}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-sg-hero-navy text-sg-on-navy">
          <div className="mx-auto max-w-sg-container px-sg-gutter py-[clamp(48px,7vw,88px)]">
            <span className="inline-flex items-center gap-2 rounded-sg-pill bg-white/10 px-3.5 py-[7px] text-[12.5px] font-bold uppercase tracking-[.5px] text-sg-gold-light">
              {t.badge}
            </span>

            <h1 className="font-display mt-5 text-[clamp(32px,5vw,58px)] font-extrabold leading-[1.05] tracking-[-1px]">
              {t.titre1}
              <br />
              {t.titre2}
            </h1>

            <p className="mt-5 max-w-[560px] text-[clamp(16px,1.7vw,19px)] leading-[1.6] text-sg-on-navy-muted">
              {t.sousTitre}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/reserver/`}
                className="rounded-sg-md bg-sg-gold px-6 py-3.5 text-[15.5px] font-bold text-sg-gold-ink shadow-sg-cta transition hover:-translate-y-px"
              >
                {t.ctaReserver}
              </Link>
              <a
                href="tel:+972534508171"
                className="inline-flex items-center gap-2.5 rounded-sg-md border-[1.5px] border-white/30 px-6 py-3.5 text-[15.5px] font-bold text-white"
                dir="ltr"
              >
                053 45 08 171
              </a>
            </div>
          </div>
        </section>

        {/* Parcours / à propos */}
        <section className="mx-auto max-w-sg-container px-sg-gutter py-[clamp(44px,6vw,72px)]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[clamp(24px,3vw,44px)]">
            <div>
              <span className="text-[13px] font-bold uppercase tracking-[1.4px] text-sg-gold-ink">
                {t.aProposLabel}
              </span>
              <h2 className="font-display mt-2.5 text-[clamp(24px,2.8vw,34px)] font-extrabold leading-[1.15] text-sg-navy">
                {t.aProposTitre}
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.7] text-sg-ink-muted">{t.langues}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {t.parcours.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-sg-lg border border-sg-border bg-sg-paper p-4"
                >
                  <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-sg-gold/20">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B4E14" strokeWidth="3">
                      <path d="M5 12l4.5 4.5L19 7" />
                    </svg>
                  </span>
                  <span className="text-[14.5px] leading-[1.5] text-sg-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tarifs */}
        <section className="mx-auto max-w-sg-container px-sg-gutter py-[clamp(44px,6vw,72px)]">
          <span className="text-[13px] font-bold uppercase tracking-[1.4px] text-sg-gold-ink">{t.tarifsLabel}</span>
          <h2 className="font-display mt-2.5 text-[clamp(24px,2.8vw,34px)] font-extrabold leading-[1.15] text-sg-navy">
            {t.tarifsTitre}
          </h2>
          <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {t.niveaux.map((n) => (
              <div
                key={n.titre}
                className="rounded-sg-xl border-2 border-sg-navy bg-sg-navy p-6 text-sg-on-navy shadow-sg-card"
              >
                <span className="font-display text-[18px] font-bold">{n.titre}</span>
                <p className="mt-1 text-[13.5px] text-sg-on-navy-muted">{n.detail}</p>
                <p className="font-display mt-4 text-[36px] font-extrabold text-sg-gold-light">
                  {n.prix}
                  <span className="ml-1.5 text-[14px] font-semibold text-sg-on-navy-muted">{t.parHeure}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13.5px] text-sg-muted">{t.tarifsNote}</p>
        </section>

        {/* Atouts */}
        <section className="border-y border-sg-border bg-sg-paper">
          <div className="mx-auto max-w-sg-container px-sg-gutter py-[clamp(40px,5vw,64px)]">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {t.atouts.map((a) => (
                <div key={a.titre} className="rounded-sg-lg border border-sg-border bg-white p-5">
                  <h3 className="font-display text-[16px] font-bold text-sg-navy">{a.titre}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.55] text-sg-ink-muted">{a.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zones */}
        <section className="border-t border-sg-border bg-sg-navy text-sg-on-navy">
          <div className="mx-auto max-w-sg-container px-sg-gutter py-[clamp(32px,4vw,48px)] text-center">
            <p className="text-[13px] font-bold uppercase tracking-[1.4px] text-sg-gold-light">{t.zoneLabel}</p>
            <p className="font-display mt-2 text-[clamp(18px,2.2vw,24px)] font-bold">{t.zoneTexte}</p>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-sg-container px-sg-gutter py-[clamp(48px,6vw,80px)] text-center">
          <h2 className="font-display text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.15] text-sg-navy">
            {t.ctaFinalTitre}
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[15.5px] leading-[1.6] text-sg-ink-muted">
            {t.ctaFinalTexte}
          </p>
          <Link
            href={`/${locale}/reserver/`}
            className="mt-6 inline-flex items-center gap-2 rounded-sg-md bg-sg-gold px-7 py-4 text-[16px] font-bold text-sg-gold-ink shadow-sg-cta transition hover:-translate-y-px"
          >
            {t.ctaReserver}
          </Link>
        </section>
      </main>

      <footer className="border-t border-sg-border bg-sg-paper py-8">
        <div className="mx-auto flex max-w-sg-container flex-wrap items-center justify-between gap-3 px-sg-gutter text-[13px] text-sg-muted">
          <span>
            © {new Date().getFullYear()} {dict.siteName}
          </span>
          <a href="tel:+972534508171" className="font-semibold text-sg-navy" dir="ltr">
            053 45 08 171
          </a>
        </div>
      </footer>
    </>
  );
}

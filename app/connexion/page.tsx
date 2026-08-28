"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [statut, setStatut] = useState<"idle" | "envoi" | "envoye" | "erreur">("idle");

  useEffect(() => {
    fetch("/api/auth/moi")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.connecte) window.location.href = "/mon-compte/";
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatut("envoi");
    try {
      const res = await fetch("/api/auth/demander-lien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setStatut("envoye");
    } catch {
      setStatut("erreur");
    }
  }

  return (
    <>
      <header className="border-b border-sg-border bg-sg-cream">
        <div className="mx-auto flex max-w-sg-container items-center justify-between px-sg-gutter py-4">
          <Link href="/" className="font-display text-[20px] font-extrabold text-sg-navy">
            Shiour Gavriel
          </Link>
          <Link href="/" className="text-[13.5px] font-semibold text-sg-navy underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[440px] px-sg-gutter py-[clamp(40px,6vw,72px)]">
        <h1 className="font-display text-[clamp(24px,3vw,30px)] font-extrabold text-sg-navy">
          Se connecter
        </h1>
        <p className="mt-2 text-[14.5px] leading-[1.6] text-sg-ink-muted">
          Entrez votre e-mail, vous recevrez un lien de connexion — pas de mot de passe à retenir.
        </p>

        {statut === "envoye" ? (
          <div className="mt-7 rounded-sg-xl border border-sg-border bg-sg-paper p-6 text-center">
            <h2 className="font-display text-[18px] font-bold text-sg-navy">E-mail envoyé !</h2>
            <p className="mt-2 text-[14px] leading-[1.6] text-sg-ink-muted">
              Ouvrez votre boîte mail ({email}) et cliquez sur le lien reçu pour vous connecter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
              E-mail
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
              />
            </label>
            {statut === "erreur" && (
              <p className="text-[13.5px] font-semibold text-red-600">
                L'envoi a échoué. Réessayez, ou réservez sans compte au 053 45 08 171.
              </p>
            )}
            <button
              type="submit"
              disabled={statut === "envoi"}
              className="rounded-sg-md bg-sg-gold py-3.5 text-[15.5px] font-bold text-sg-gold-ink shadow-sg-cta transition hover:-translate-y-px disabled:opacity-60"
            >
              {statut === "envoi" ? "Envoi en cours…" : "Recevoir mon lien de connexion →"}
            </button>
            <p className="text-center text-[13px] text-sg-muted">
              Pas encore de compte ? Il sera créé automatiquement à la première connexion.
            </p>
          </form>
        )}
      </main>
    </>
  );
}

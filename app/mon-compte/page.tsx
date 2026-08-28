"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Profil {
  id: string;
  email: string;
  nom: string;
  telephone: string | null;
  adresse: string | null;
  digicode: string | null;
  niveau: string | null;
  lieu_prefere: string | null;
}

const LIEUX = [
  { id: "eleve", label: "Chez l'élève" },
  { id: "prof", label: "Chez le professeur" },
  { id: "zoom", label: "Par Zoom" },
] as const;

function MonCompteContenu() {
  const params = useSearchParams();
  const bienvenue = params.get("bienvenue") === "1";

  const [profil, setProfil] = useState<Profil | null>(null);
  const [etat, setEtat] = useState<"chargement" | "pret" | "non-connecte">("chargement");
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/moi")
      .then((r) => {
        if (r.status === 401) {
          setEtat("non-connecte");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.profil) {
          setProfil(data.profil);
          setEtat("pret");
        }
      })
      .catch(() => setEtat("non-connecte"));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnregistrement(true);
    setMessage("");
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/auth/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setMessage("Profil enregistré.");
    } catch {
      setMessage("Erreur lors de l'enregistrement. Réessayez.");
    } finally {
      setEnregistrement(false);
    }
  }

  if (etat === "chargement") {
    return <p className="mt-8 text-[14.5px] text-sg-muted">Chargement…</p>;
  }

  if (etat === "non-connecte") {
    return (
      <div className="mt-8 rounded-sg-xl border border-sg-border bg-sg-paper p-6 text-center">
        <p className="text-[14.5px] text-sg-ink">Vous n'êtes pas connecté(e).</p>
        <Link
          href="/connexion/"
          className="mt-4 inline-block rounded-sg-md bg-sg-gold px-5 py-2.5 text-[14px] font-bold text-sg-gold-ink"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  if (!profil) return null;

  return (
    <>
      {bienvenue && (
        <div className="mt-6 rounded-sg-lg border border-sg-gold bg-sg-gold/10 p-4 text-[14px] text-sg-ink">
          Bienvenue ! Complétez votre profil ci-dessous pour ne plus avoir à ressaisir vos informations lors
          des prochaines réservations.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <p className="text-[13.5px] text-sg-muted">Connecté(e) en tant que {profil.email}</p>

        <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
          Nom *
          <input
            required
            name="nom"
            defaultValue={profil.nom}
            className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
          Téléphone
          <input
            name="telephone"
            type="tel"
            defaultValue={profil.telephone ?? ""}
            className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
          Niveau scolaire
          <input
            name="niveau"
            defaultValue={profil.niveau ?? ""}
            className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
          Adresse (pour les cours à domicile)
          <input
            name="adresse"
            defaultValue={profil.adresse ?? ""}
            className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
          Digicode / instructions d'accès
          <input
            name="digicode"
            defaultValue={profil.digicode ?? ""}
            className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
          />
        </label>
        <div>
          <span className="mb-1.5 block text-[14px] font-semibold text-sg-ink">Lieu préféré</span>
          <div className="flex flex-wrap gap-2">
            {LIEUX.map((l) => (
              <label
                key={l.id}
                className="flex items-center gap-1.5 rounded-sg-pill border border-sg-border px-3.5 py-2 text-[13.5px] font-semibold text-sg-ink has-[:checked]:border-sg-navy has-[:checked]:bg-sg-navy has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="lieu_prefere"
                  value={l.id}
                  defaultChecked={profil.lieu_prefere === l.id}
                  className="sr-only"
                />
                {l.label}
              </label>
            ))}
          </div>
        </div>

        {message && <p className="text-[13.5px] font-semibold text-sg-navy">{message}</p>}

        <button
          type="submit"
          disabled={enregistrement}
          className="rounded-sg-md bg-sg-gold py-3.5 text-[15.5px] font-bold text-sg-gold-ink shadow-sg-cta transition hover:-translate-y-px disabled:opacity-60"
        >
          {enregistrement ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <form action="/api/auth/deconnexion" method="POST" className="mt-4">
        <button type="submit" className="text-[13.5px] font-semibold text-sg-muted underline">
          Se déconnecter
        </button>
      </form>
    </>
  );
}

export default function MonComptePage() {
  return (
    <>
      <header className="border-b border-sg-border bg-sg-cream">
        <div className="mx-auto flex max-w-sg-container items-center justify-between px-sg-gutter py-4">
          <Link href="/" className="font-display text-[20px] font-extrabold text-sg-navy">
            Shiour Gavriel
          </Link>
          <Link href="/reserver/" className="text-[13.5px] font-semibold text-sg-navy underline">
            Réserver un cours →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-sg-gutter py-[clamp(32px,5vw,56px)]">
        <h1 className="font-display text-[clamp(24px,3vw,30px)] font-extrabold text-sg-navy">Mon compte</h1>
        <Suspense fallback={<p className="mt-8 text-[14.5px] text-sg-muted">Chargement…</p>}>
          <MonCompteContenu />
        </Suspense>
      </main>
    </>
  );
}

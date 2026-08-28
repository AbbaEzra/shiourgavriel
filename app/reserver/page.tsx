"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

interface Creneau {
  start: string; // ISO
  end: string; // ISO
}

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

type Etape = "chargement" | "choix" | "formulaire" | "envoi" | "confirme" | "erreur";
type EtapeCompte = "masque" | "propose" | "envoi" | "envoye";

const LIEUX = [
  { id: "eleve", label: "Chez l'élève" },
  { id: "prof", label: "Chez le professeur" },
  { id: "zoom", label: "Par Zoom" },
] as const;

const NIVEAUX = [
  "6ème",
  "5ème",
  "4ème",
  "3ème",
  "2nde",
  "1ère",
  "Terminale",
  "Autre",
];

function formatJour(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ReserverPage() {
  const [etape, setEtape] = useState<Etape>("chargement");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [choisi, setChoisi] = useState<Creneau | null>(null);
  const [lieu, setLieu] = useState<(typeof LIEUX)[number]["id"]>("zoom");
  const [erreur, setErreur] = useState<string>("");
  const [profil, setProfil] = useState<Profil | null>(null);
  const [emailReservation, setEmailReservation] = useState("");

  const [etapeCompte, setEtapeCompte] = useState<EtapeCompte>("masque");

  useEffect(() => {
    let annule = false;
    fetch("/api/availability")
      .then((r) => {
        if (!r.ok) throw new Error("Réponse invalide du serveur");
        return r.json();
      })
      .then((data: { creneaux: Creneau[] }) => {
        if (annule) return;
        setCreneaux(data.creneaux ?? []);
        setEtape("choix");
      })
      .catch(() => {
        if (annule) return;
        setErreur(
          "Impossible de charger les créneaux disponibles pour le moment. Contactez directement Gabriel au 053 45 08 171.",
        );
        setEtape("erreur");
      });

    fetch("/api/auth/moi")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (annule || !data?.profil) return;
        setProfil(data.profil);
        if (data.profil.lieu_prefere) setLieu(data.profil.lieu_prefere);
      })
      .catch(() => {});

    return () => {
      annule = true;
    };
  }, []);

  const parJour = useMemo(() => {
    const groupes = new Map<string, Creneau[]>();
    for (const c of creneaux) {
      const jour = new Date(c.start).toDateString();
      if (!groupes.has(jour)) groupes.set(jour, []);
      groupes.get(jour)!.push(c);
    }
    return Array.from(groupes.values());
  }, [creneaux]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!choisi) return;
    setEtape("envoi");
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries());
    setEmailReservation(String(fields.email ?? ""));
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, start: choisi.start, end: choisi.end, lieu }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Échec de la réservation");
      setEtape("confirme");
      setEtapeCompte(profil ? "masque" : "propose");
    } catch (err) {
      setErreur((err as Error).message || "La réservation a échoué. Réessayez ou contactez Gabriel au 053 45 08 171.");
      setEtape("formulaire");
    }
  }

  async function handleCreerCompte(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEtapeCompte("envoi");
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/auth/creer-compte-apres-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, lieu }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setEtapeCompte("envoye");
    } catch {
      setEtapeCompte("propose");
    }
  }

  return (
    <>
      <header className="border-b border-sg-border bg-sg-cream">
        <div className="mx-auto flex max-w-sg-container items-center justify-between px-sg-gutter py-4">
          <Link href="/" className="font-display text-[20px] font-extrabold text-sg-navy">
            Shiour Gavriel
          </Link>
          {profil ? (
            <Link href="/mon-compte/" className="text-[13.5px] font-semibold text-sg-navy underline">
              Mon compte ({profil.nom})
            </Link>
          ) : (
            <Link href="/connexion/" className="text-[13.5px] font-semibold text-sg-navy underline">
              Déjà inscrit ? Se connecter
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[640px] px-sg-gutter py-[clamp(32px,5vw,56px)]">
        <h1 className="font-display text-[clamp(26px,3.2vw,34px)] font-extrabold text-sg-navy">
          Réserver un cours
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-sg-ink-muted">
          Choisissez un créneau disponible dans l'agenda de Gabriel.
        </p>

        {etape === "chargement" && (
          <p className="mt-8 text-[14.5px] text-sg-muted">Chargement des créneaux disponibles…</p>
        )}

        {etape === "erreur" && (
          <p className="mt-8 rounded-sg-lg border border-sg-border bg-sg-paper p-4 text-[14.5px] text-sg-ink">
            {erreur}
          </p>
        )}

        {etape === "choix" && (
          <div className="mt-7 flex flex-col gap-5">
            {parJour.length === 0 && (
              <p className="text-[14.5px] text-sg-muted">
                Aucun créneau disponible pour le moment. Contactez Gabriel directement au{" "}
                <a href="tel:+972534508171" className="font-semibold text-sg-navy">
                  053 45 08 171
                </a>
                .
              </p>
            )}
            {parJour.map((jour) => (
              <div key={jour[0].start}>
                <h3 className="text-[13.5px] font-bold uppercase tracking-[.5px] text-sg-gold-ink">
                  {formatJour(jour[0].start)}
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {jour.map((c) => (
                    <button
                      key={c.start}
                      type="button"
                      onClick={() => {
                        setChoisi(c);
                        setEtape("formulaire");
                      }}
                      className="rounded-sg-md border border-sg-border bg-white px-4 py-2.5 text-[14px] font-semibold text-sg-ink transition hover:border-sg-navy hover:bg-sg-navy hover:text-white"
                    >
                      {formatHeure(c.start)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {(etape === "formulaire" || etape === "envoi") && choisi && (
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <div className="rounded-sg-lg border border-sg-border bg-sg-paper p-4">
              <p className="text-[14px] font-semibold text-sg-ink">
                Créneau choisi : {formatJour(choisi.start)} à {formatHeure(choisi.start)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setChoisi(null);
                  setEtape("choix");
                }}
                className="mt-1 text-[13px] font-semibold text-sg-navy underline"
              >
                Changer de créneau
              </button>
            </div>

            {profil && (
              <p className="text-[13px] text-sg-muted">
                Vos informations sont pré-remplies depuis votre profil — modifiez-les si besoin.
              </p>
            )}

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
              Nom de l'élève / du parent *
              <input
                required
                name="nom"
                defaultValue={profil?.nom ?? ""}
                className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
              />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
                Téléphone *
                <input
                  required
                  type="tel"
                  name="telephone"
                  defaultValue={profil?.telephone ?? ""}
                  className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
                Email *
                <input
                  required
                  type="email"
                  name="email"
                  defaultValue={profil?.email ?? ""}
                  className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
              Niveau scolaire *
              <select
                required
                name="niveau"
                defaultValue={profil?.niveau ?? ""}
                className="rounded-sg-md border border-sg-border bg-white px-3.5 py-2.5 text-[14.5px] text-sg-ink outline-none focus-visible:border-sg-navy"
              >
                <option value="">Sélectionner…</option>
                {NIVEAUX.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-[14px] font-semibold text-sg-ink">Lieu du cours *</span>
              <div className="flex flex-wrap gap-2">
                {LIEUX.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLieu(l.id)}
                    aria-pressed={lieu === l.id}
                    className={`rounded-sg-pill border px-4 py-2 text-[13.5px] font-semibold transition ${
                      lieu === l.id ? "border-sg-navy bg-sg-navy text-white" : "border-sg-border bg-white text-sg-ink"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {lieu === "eleve" && (
              <>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
                  Adresse *
                  <input
                    required
                    name="adresse"
                    defaultValue={profil?.adresse ?? ""}
                    placeholder="Rue, numéro, ville"
                    className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
                  Digicode / instructions d'accès
                  <input
                    name="digicode"
                    defaultValue={profil?.digicode ?? ""}
                    placeholder="Code d'entrée, étage…"
                    className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
                  />
                </label>
              </>
            )}

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-sg-ink">
              Message (optionnel)
              <textarea
                name="message"
                rows={3}
                placeholder="Sujet à travailler, urgence, précisions…"
                className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14.5px] outline-none focus-visible:border-sg-navy"
              />
            </label>

            {erreur && <p className="text-[13.5px] font-semibold text-red-600">{erreur}</p>}

            <button
              type="submit"
              disabled={etape === "envoi"}
              className="rounded-sg-md bg-sg-gold py-3.5 text-[15.5px] font-bold text-sg-gold-ink shadow-sg-cta transition hover:-translate-y-px disabled:opacity-60"
            >
              {etape === "envoi" ? "Réservation en cours…" : "Confirmer la réservation →"}
            </button>
          </form>
        )}

        {etape === "confirme" && choisi && (
          <div className="mt-8 flex flex-col gap-4">
            <div className="rounded-sg-xl border border-sg-border bg-sg-paper p-6 text-center">
              <h2 className="font-display text-[20px] font-bold text-sg-navy">Réservation confirmée !</h2>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-sg-ink-muted">
                Votre cours est réservé le {formatJour(choisi.start)} à {formatHeure(choisi.start)}. Un e-mail
                de confirmation vous a été envoyé.
              </p>
              <Link href="/" className="mt-4 inline-block text-[14px] font-bold text-sg-navy underline">
                Retour à l'accueil
              </Link>
            </div>

            {etapeCompte === "propose" && (
              <form
                onSubmit={handleCreerCompte}
                className="rounded-sg-xl border border-sg-border bg-white p-6"
              >
                <input type="hidden" name="email" value={emailReservation} />
                <h3 className="font-display text-[16px] font-bold text-sg-navy">
                  Créer un compte pour la prochaine fois ?
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.55] text-sg-ink-muted">
                  Vous n'aurez plus à ressaisir votre adresse, digicode et niveau aux prochaines réservations.
                </p>
                <label className="mt-3.5 flex flex-col gap-1.5 text-[13.5px] font-semibold text-sg-ink">
                  Nom
                  <input
                    required
                    name="nom"
                    className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14px] outline-none focus-visible:border-sg-navy"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1.5 text-[13.5px] font-semibold text-sg-ink">
                  Téléphone
                  <input
                    name="telephone"
                    type="tel"
                    className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14px] outline-none focus-visible:border-sg-navy"
                  />
                </label>
                {lieu === "eleve" && (
                  <>
                    <label className="mt-3 flex flex-col gap-1.5 text-[13.5px] font-semibold text-sg-ink">
                      Adresse
                      <input
                        name="adresse"
                        className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14px] outline-none focus-visible:border-sg-navy"
                      />
                    </label>
                    <label className="mt-3 flex flex-col gap-1.5 text-[13.5px] font-semibold text-sg-ink">
                      Digicode / instructions d'accès
                      <input
                        name="digicode"
                        className="rounded-sg-md border border-sg-border px-3.5 py-2.5 text-[14px] outline-none focus-visible:border-sg-navy"
                      />
                    </label>
                  </>
                )}
                <button
                  type="submit"
                  className="mt-4 w-full rounded-sg-md bg-sg-navy py-3 text-[14.5px] font-bold text-white"
                >
                  Créer mon compte →
                </button>
              </form>
            )}

            {etapeCompte === "envoye" && (
              <div className="rounded-sg-xl border border-sg-border bg-white p-6 text-center">
                <p className="text-[14px] text-sg-ink">
                  Un lien de connexion vous a été envoyé par e-mail pour activer votre compte.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

// Comptes élève optionnels : connexion par lien magique (pas de mot de passe).
// Le compte mémorise adresse / digicode / téléphone / niveau / lieu préféré pour
// ne plus les ressaisir aux réservations suivantes.
import {
  clearSessionCookie,
  createSessionCookie,
  envoyerEmail,
  getSessionEleveId,
  jsonResponse,
  type Env,
} from "./shared";

const LIEN_VALIDE_MIN = 15;

interface EleveProfil {
  id: string;
  email: string;
  nom: string;
  telephone: string | null;
  adresse: string | null;
  digicode: string | null;
  niveau: string | null;
  lieu_prefere: string | null;
}

function origin(request: Request): string {
  return new URL(request.url).origin;
}

async function creerEtEnvoyerLien(env: Env, email: string, baseUrl: string, redirect = "/reserver/"): Promise<void> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + LIEN_VALIDE_MIN * 60000).toISOString();
  await env.DB.prepare(
    `INSERT INTO magic_links (token, email, expires_at, used, created_at) VALUES (?1, ?2, ?3, 0, ?4)`,
  )
    .bind(token, email, expiresAt, new Date().toISOString())
    .run();

  const lien = `${baseUrl}/api/auth/verifier?token=${token}&redirect=${encodeURIComponent(redirect)}`;
  await envoyerEmail(
    env,
    email,
    "Votre lien de connexion — Shiour Gavriel",
    `<p>Bonjour,</p>
     <p>Cliquez sur le lien ci-dessous pour vous connecter à votre espace Shiour Gavriel
     (valable ${LIEN_VALIDE_MIN} minutes) :</p>
     <p><a href="${lien}">${lien}</a></p>
     <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>`,
  );
}

/** POST /api/auth/demander-lien — body { email, redirect? } */
export async function handleDemanderLien(request: Request, env: Env): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { email?: string; redirect?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return jsonResponse({ success: false, error: "Adresse e-mail invalide" }, 400);
  }
  try {
    await creerEtEnvoyerLien(env, email, origin(request), body?.redirect || "/reserver/");
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 502);
  }
}

/** GET /api/auth/verifier?token=...&redirect=... — clique depuis l'e-mail, pose le cookie, redirige. */
export async function handleVerifier(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirect = url.searchParams.get("redirect") || "/reserver/";
  if (!token) return new Response("Lien invalide.", { status: 400 });

  const lien = await env.DB.prepare(
    `SELECT email, expires_at, used FROM magic_links WHERE token = ?1`,
  )
    .bind(token)
    .first<{ email: string; expires_at: string; used: number }>();

  if (!lien || lien.used || new Date(lien.expires_at).getTime() < Date.now()) {
    return new Response(
      "Ce lien de connexion est invalide ou a expiré. Retournez sur le site pour en redemander un.",
      { status: 400 },
    );
  }
  await env.DB.prepare(`UPDATE magic_links SET used = 1 WHERE token = ?1`).bind(token).run();

  let eleve = await env.DB.prepare(`SELECT id FROM eleves WHERE email = ?1`)
    .bind(lien.email)
    .first<{ id: string }>();

  let eleveId: string;
  let premiereConnexion = false;
  if (eleve) {
    eleveId = eleve.id;
  } else {
    eleveId = crypto.randomUUID();
    premiereConnexion = true;
    await env.DB.prepare(
      `INSERT INTO eleves (id, email, nom, created_at) VALUES (?1, ?2, ?3, ?4)`,
    )
      .bind(eleveId, lien.email, lien.email.split("@")[0], new Date().toISOString())
      .run();
  }

  const cookie = await createSessionCookie(eleveId, env);
  const destination = premiereConnexion ? "/mon-compte/?bienvenue=1" : redirect;
  return new Response(null, {
    status: 302,
    headers: { Location: destination, "Set-Cookie": cookie },
  });
}

/** GET /api/auth/moi — profil de l'élève connecté (401 si pas de session valide). */
export async function handleMoi(request: Request, env: Env): Promise<Response> {
  const eleveId = await getSessionEleveId(request, env);
  if (!eleveId) return jsonResponse({ connecte: false }, 401);

  const profil = await env.DB.prepare(
    `SELECT id, email, nom, telephone, adresse, digicode, niveau, lieu_prefere FROM eleves WHERE id = ?1`,
  )
    .bind(eleveId)
    .first<EleveProfil>();

  if (!profil) return jsonResponse({ connecte: false }, 401);
  return jsonResponse({ connecte: true, profil });
}

/** POST /api/auth/profil — met à jour le profil de l'élève connecté. */
export async function handleMettreAJourProfil(request: Request, env: Env): Promise<Response> {
  const eleveId = await getSessionEleveId(request, env);
  if (!eleveId) return jsonResponse({ success: false, error: "Non connecté" }, 401);

  const body = (await request.json().catch(() => null)) as Partial<EleveProfil> | null;
  if (!body?.nom) return jsonResponse({ success: false, error: "Le nom est requis" }, 400);

  await env.DB.prepare(
    `UPDATE eleves SET nom = ?1, telephone = ?2, adresse = ?3, digicode = ?4, niveau = ?5, lieu_prefere = ?6 WHERE id = ?7`,
  )
    .bind(
      body.nom,
      body.telephone ?? null,
      body.adresse ?? null,
      body.digicode ?? null,
      body.niveau ?? null,
      body.lieu_prefere ?? null,
      eleveId,
    )
    .run();

  return jsonResponse({ success: true });
}

/** POST /api/auth/deconnexion */
export async function handleDeconnexion(): Promise<Response> {
  return new Response(null, {
    status: 302,
    headers: { Location: "/", "Set-Cookie": clearSessionCookie() },
  });
}

/**
 * POST /api/auth/creer-compte-apres-reservation
 * body { email, nom, telephone, adresse, digicode, niveau, lieu }
 * Crée (ou met à jour) le profil élève à partir des infos déjà saisies lors d'une
 * réservation invité, puis envoie un lien de connexion pour activer l'accès au compte.
 */
export async function handleCreerCompteApresReservation(request: Request, env: Env): Promise<Response> {
  const body = (await request.json().catch(() => null)) as
    | (Partial<EleveProfil> & { email?: string; lieu?: string })
    | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !body?.nom) {
    return jsonResponse({ success: false, error: "Informations manquantes" }, 400);
  }

  const existant = await env.DB.prepare(`SELECT id FROM eleves WHERE email = ?1`)
    .bind(email)
    .first<{ id: string }>();

  if (existant) {
    await env.DB.prepare(
      `UPDATE eleves SET nom = ?1, telephone = ?2, adresse = ?3, digicode = ?4, niveau = ?5, lieu_prefere = ?6 WHERE id = ?7`,
    )
      .bind(
        body.nom,
        body.telephone ?? null,
        body.adresse ?? null,
        body.digicode ?? null,
        body.niveau ?? null,
        body.lieu ?? null,
        existant.id,
      )
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO eleves (id, email, nom, telephone, adresse, digicode, niveau, lieu_prefere, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
    )
      .bind(
        crypto.randomUUID(),
        email,
        body.nom,
        body.telephone ?? null,
        body.adresse ?? null,
        body.digicode ?? null,
        body.niveau ?? null,
        body.lieu ?? null,
        new Date().toISOString(),
      )
      .run();
  }

  try {
    await creerEtEnvoyerLien(env, email, origin(request), "/reserver/");
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 502);
  }
}

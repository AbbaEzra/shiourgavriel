// Logique partagée entre availability.ts et book.ts : configuration des créneaux
// et échange du refresh token Google contre un access token à courte durée de vie.

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN: string;
  GOOGLE_CALENDAR_ID: string;
}

// --- Plage de disponibilité par défaut (à ajuster selon les préférences de Gabriel) ---
// Jours : 1 = lundi ... 7 = dimanche. Horaires en heure locale Israël.
export const JOURS_DISPONIBLES = [1, 2, 3, 4]; // lundi à jeudi
export const HEURE_DEBUT = 16; // 16h
export const HEURE_FIN = 20; // 20h
export const DUREE_CRENEAU_MIN = 60; // durée d'un créneau, en minutes
export const JOURS_A_AFFICHER = 14; // fenêtre de réservation (2 semaines glissantes)
export const TIMEZONE = "Asia/Jerusalem";

/** Échange le refresh token contre un access token Google valide (courte durée). */
export async function getAccessToken(env: Env): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Échec du rafraîchissement du token Google (${res.status})`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

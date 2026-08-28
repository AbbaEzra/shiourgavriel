// Logique partagée : config créneaux, échange refresh token → access token Google,
// et signature/vérification des sessions élève (cookie signé, sans dépendance externe).

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN: string;
  GOOGLE_CALENDAR_ID: string;
  SESSION_SECRET: string;
}

// --- Plage de disponibilité par défaut (à ajuster selon les préférences de Gabriel) ---
// Jours (convention JS Date#getUTCDay) : 0 = dimanche ... 6 = samedi. Horaires en heure locale Israël.
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

export function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

// ------------------------- Sessions (cookie signé) -------------------------
// Pas de JWT/bibliothèque externe : payload base64url + signature HMAC-SHA256
// (Web Crypto, natif au runtime Workers), vérifiée à chaque requête.

const SESSION_COOKIE = "session";
const SESSION_DUREE_JOURS = 180;

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "="));
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionCookie(eleveId: string, env: Env): Promise<string> {
  const exp = Date.now() + SESSION_DUREE_JOURS * 86400000;
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ sub: eleveId, exp })));
  const key = await hmacKey(env.SESSION_SECRET);
  const sig = toBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  const value = `${payload}.${sig}`;
  return `${SESSION_COOKIE}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DUREE_JOURS * 86400}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/** Retourne l'id élève si la session est valide, sinon null. */
export async function getSessionEleveId(request: Request, env: Env): Promise<string | null> {
  const value = readCookie(request, SESSION_COOKIE);
  if (!value) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  try {
    const key = await hmacKey(env.SESSION_SECRET);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      sub: string;
      exp: number;
    };
    if (data.exp < Date.now()) return null;
    return data.sub;
  } catch {
    return null;
  }
}

// ------------------------- Envoi d'e-mail (Gmail API) -------------------------
// Réutilise le même compte Google / refresh token que Calendar (scope gmail.send
// à ajouter lors de l'autorisation OAuth, voir README).

export async function envoyerEmail(env: Env, to: string, subject: string, htmlBody: string): Promise<void> {
  const accessToken = await getAccessToken(env);
  const message = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    htmlBody,
  ].join("\r\n");
  const raw = toBase64Url(new TextEncoder().encode(message));

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    throw new Error(`Échec de l'envoi de l'e-mail (${res.status})`);
  }
}

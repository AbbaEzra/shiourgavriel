// POST /api/book — crée la réservation : événement Google Calendar (avec
// invitation e-mail automatique à l'élève via sendUpdates=all) + ligne D1.
import { getAccessToken, jsonResponse, type Env } from "./_shared";

interface ReservationBody {
  start: string;
  end: string;
  nom: string;
  telephone: string;
  email: string;
  niveau: string;
  lieu: string;
  message?: string;
  botcheck?: string; // honeypot anti-spam, doit rester vide
}

const LABEL_LIEU: Record<string, string> = {
  eleve: "Chez l'élève",
  prof: "Chez le professeur",
  zoom: "Par Zoom",
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  let body: ReservationBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Requête invalide" }, 400);
  }

  if (body.botcheck) {
    // Honeypot rempli par un bot : on répond succès sans rien faire.
    return jsonResponse({ success: true, id: "ignored" });
  }

  const requis: (keyof ReservationBody)[] = ["start", "end", "nom", "telephone", "email", "niveau", "lieu"];
  for (const champ of requis) {
    if (!body[champ]) {
      return jsonResponse({ success: false, error: `Champ manquant : ${champ}` }, 400);
    }
  }

  // Anti double-réservation : on vérifie qu'aucune ligne confirmée ne couvre déjà ce créneau.
  const existant = await env.DB.prepare(
    `SELECT id FROM reservations WHERE statut = 'confirme' AND date_heure_debut = ?1`,
  )
    .bind(body.start)
    .first();
  if (existant) {
    return jsonResponse({ success: false, error: "Ce créneau vient d'être réservé par quelqu'un d'autre." }, 409);
  }

  const id = crypto.randomUUID();
  const lieuLabel = LABEL_LIEU[body.lieu] ?? body.lieu;

  let googleEventId: string | null = null;
  try {
    const accessToken = await getAccessToken(env);
    const evRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID)}/events?sendUpdates=all`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `Cours de maths — ${body.nom} (${body.niveau})`,
          description: [
            `Élève / parent : ${body.nom}`,
            `Téléphone : ${body.telephone}`,
            `Email : ${body.email}`,
            `Niveau : ${body.niveau}`,
            `Lieu : ${lieuLabel}`,
            body.message ? `Message : ${body.message}` : null,
            "",
            "Réservé via shiourgavriel.com",
          ]
            .filter(Boolean)
            .join("\n"),
          start: { dateTime: body.start },
          end: { dateTime: body.end },
          attendees: [{ email: body.email, displayName: body.nom }],
        }),
      },
    );
    if (!evRes.ok) throw new Error(`Création de l'événement Google Calendar échouée (${evRes.status})`);
    const evData = (await evRes.json()) as { id: string };
    googleEventId = evData.id;
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 502);
  }

  await env.DB.prepare(
    `INSERT INTO reservations
      (id, date_heure_debut, date_heure_fin, nom_eleve, telephone, email, niveau, lieu, message, statut, google_event_id, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'confirme', ?10, ?11)`,
  )
    .bind(
      id,
      body.start,
      body.end,
      body.nom,
      body.telephone,
      body.email,
      body.niveau,
      body.lieu,
      body.message ?? null,
      googleEventId,
      new Date().toISOString(),
    )
    .run();

  return jsonResponse({ success: true, id });
};

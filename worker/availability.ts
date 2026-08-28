// GET /api/availability — renvoie les créneaux libres des prochains jours,
// en croisant les horaires d'ouverture définis avec l'agenda Google Calendar
// de Gabriel (freeBusy) et les réservations déjà enregistrées dans D1.
import {
  DUREE_CRENEAU_MIN,
  HEURE_DEBUT,
  HEURE_FIN,
  JOURS_A_AFFICHER,
  JOURS_DISPONIBLES,
  MARGE_TRAJET_MIN,
  TIMEZONE,
  getAccessToken,
  jsonResponse,
  type Env,
} from "./shared";

const DELAI_MIN_MINUTES = 120; // pas de réservation à moins de 2h du début du créneau

interface Creneau {
  start: string;
  end: string;
}

function offsetMinutes(approxUtc: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(approxUtc);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+2";
  const match = tz.match(/GMT([+-]\d+)(?::(\d+))?/);
  const h = match ? parseInt(match[1], 10) : 2;
  const m = match?.[2] ? parseInt(match[2], 10) : 0;
  return h * 60 + (h < 0 ? -m : m);
}

function jerusalemToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const naive = new Date(Date.UTC(year, month, day, hour, minute));
  return new Date(naive.getTime() - offsetMinutes(naive) * 60000);
}

function jerusalemToday(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return {
    year: Number(parts.find((p) => p.type === "year")!.value),
    month: Number(parts.find((p) => p.type === "month")!.value) - 1,
    day: Number(parts.find((p) => p.type === "day")!.value),
  };
}

function genererCreneauxCandidats(): Creneau[] {
  const { year, month, day } = jerusalemToday();
  const base = new Date(Date.UTC(year, month, day));
  const creneaux: Creneau[] = [];

  for (let d = 0; d < JOURS_A_AFFICHER; d++) {
    const jourDate = new Date(base.getTime() + d * 86400000);
    const dow = jourDate.getUTCDay(); // 0 = dimanche ... 6 = samedi
    if (!JOURS_DISPONIBLES.includes(dow)) continue;

    for (let h = HEURE_DEBUT; h < HEURE_FIN; h += DUREE_CRENEAU_MIN / 60) {
      const heure = Math.floor(h);
      const minute = Math.round((h - heure) * 60);
      const start = jerusalemToUtc(
        jourDate.getUTCFullYear(),
        jourDate.getUTCMonth(),
        jourDate.getUTCDate(),
        heure,
        minute,
      );
      const end = new Date(start.getTime() + DUREE_CRENEAU_MIN * 60000);
      creneaux.push({ start: start.toISOString(), end: end.toISOString() });
    }
  }
  return creneaux;
}

export async function handleAvailability(env: Env): Promise<Response> {
  const candidats = genererCreneauxCandidats();
  const maintenant = Date.now() + DELAI_MIN_MINUTES * 60000;
  const futurs = candidats.filter((c) => new Date(c.start).getTime() > maintenant);

  if (futurs.length === 0) {
    return jsonResponse({ creneaux: [] });
  }

  try {
    const accessToken = await getAccessToken(env);
    const timeMin = futurs[0].start;
    const timeMax = futurs[futurs.length - 1].end;

    const fbRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: env.GOOGLE_CALENDAR_ID }],
      }),
    });
    if (!fbRes.ok) throw new Error(`freeBusy a échoué (${fbRes.status})`);
    const fbData = (await fbRes.json()) as {
      calendars: Record<string, { busy: { start: string; end: string }[] }>;
    };
    const busy = fbData.calendars[env.GOOGLE_CALENDAR_ID]?.busy ?? [];

    const margeMs = MARGE_TRAJET_MIN * 60000;
    const libres = futurs.filter((c) => {
      const cStart = new Date(c.start).getTime();
      const cEnd = new Date(c.end).getTime();
      return !busy.some((b) => {
        const bStart = new Date(b.start).getTime() - margeMs;
        const bEnd = new Date(b.end).getTime() + margeMs;
        return cStart < bEnd && cEnd > bStart; // chevauchement (marge de trajet incluse)
      });
    });

    return jsonResponse({ creneaux: libres });
  } catch (err) {
    return jsonResponse({ creneaux: [], error: (err as Error).message }, 502);
  }
}

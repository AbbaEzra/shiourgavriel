// Point d'entrée unique du Worker : sert les fichiers statiques (out/, via le
// binding ASSETS) et intercepte /api/* pour la logique de réservation.
import { handleAvailability } from "./availability";
import { handleBook } from "./book";
import { jsonResponse, type Env } from "./shared";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/availability" && request.method === "GET") {
      return handleAvailability(env);
    }
    if (url.pathname === "/api/book" && request.method === "POST") {
      return handleBook(request, env);
    }
    if (url.pathname.startsWith("/api/")) {
      return jsonResponse({ error: "Route inconnue" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

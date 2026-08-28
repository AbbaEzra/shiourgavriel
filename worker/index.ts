// Point d'entrée unique du Worker : sert les fichiers statiques (out/, via le
// binding ASSETS) et intercepte /api/* pour la logique de réservation et de comptes élève.
import { handleAvailability } from "./availability";
import { handleBook } from "./book";
import {
  handleCreerCompteApresReservation,
  handleDemanderLien,
  handleDeconnexion,
  handleMettreAJourProfil,
  handleMoi,
  handleVerifier,
} from "./auth";
import { jsonResponse, type Env } from "./shared";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const { method } = request;

    // Racine du site : redirige vers /fr/ ou /he/ selon la langue du navigateur.
    if (pathname === "/") {
      const acceptLanguage = request.headers.get("Accept-Language") ?? "";
      const locale = acceptLanguage.toLowerCase().startsWith("he") ? "he" : "fr";
      return Response.redirect(`${url.origin}/${locale}/`, 302);
    }

    if (pathname === "/api/availability" && method === "GET") return handleAvailability(env);
    if (pathname === "/api/book" && method === "POST") return handleBook(request, env);

    if (pathname === "/api/auth/demander-lien" && method === "POST") return handleDemanderLien(request, env);
    if (pathname === "/api/auth/verifier" && method === "GET") return handleVerifier(request, env);
    if (pathname === "/api/auth/moi" && method === "GET") return handleMoi(request, env);
    if (pathname === "/api/auth/profil" && method === "POST") return handleMettreAJourProfil(request, env);
    if (pathname === "/api/auth/deconnexion" && method === "POST") return handleDeconnexion(request);
    if (pathname === "/api/auth/creer-compte-apres-reservation" && method === "POST")
      return handleCreerCompteApresReservation(request, env);

    if (pathname.startsWith("/api/")) {
      return jsonResponse({ error: "Route inconnue" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

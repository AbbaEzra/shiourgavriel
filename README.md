# Shiour Gavriel — site vitrine + réservation

Site de Gabriel Krief : cours particuliers de mathématiques. Page vitrine statique (Next.js, export)
+ page de réservation connectée à Google Agenda via des Cloudflare Pages Functions, avec Cloudflare D1
comme garde-fou anti-double-réservation.

## Structure

```
app/                    Pages Next.js (export statique)
  page.tsx              Vitrine
  reserver/page.tsx      Réservation (client component, appelle /api/*)
functions/api/           Cloudflare Pages Functions (Workers runtime, pas Next.js)
  _shared.ts             Config créneaux + échange refresh token → access token
  availability.ts        GET  /api/availability
  book.ts                 POST /api/book
schema.sql               Schéma de la base D1 (table reservations)
```

## Ce qu'il reste à configurer avant que la réservation fonctionne

Le site (vitrine + page réservation) est prêt à être déployé, mais **la réservation ne
fonctionnera qu'une fois ces éléments configurés côté Cloudflare** :

### 1. Base de données Cloudflare D1

1. Dashboard Cloudflare → **Workers & Pages** → **D1 SQL Database** → **Create database**
2. Nom : `shiourgavriel-db` (ou autre)
3. Une fois créée → onglet **Console** → coller le contenu de `schema.sql` → exécuter
4. Retourner sur le projet Pages **shiourgavriel** → **Settings** → **Functions** → **D1 database bindings**
   → **Add binding** : nom de variable `DB`, base = celle créée à l'étape 2

### 2. Identifiants Google Calendar (OAuth)

Le compte à connecter est `gavrielkrief66@gmail.com`.

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com/), créer un nouveau projet
   (ex. "Shiour Gavriel")
2. **APIs & Services → Library** → chercher **Google Calendar API** → **Enable**
3. **APIs & Services → Credentials** → **Create Credentials → OAuth client ID**
   - Type d'application : **Web application**
   - URI de redirection autorisée : `https://developers.google.com/oauthplayground`
   - Noter le **Client ID** et le **Client Secret** générés
4. Aller sur [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground/)
   - Cliquer sur l'icône ⚙️ (en haut à droite) → cocher **Use your own OAuth credentials** → coller
     Client ID / Client Secret
   - Dans la liste à gauche, trouver **Calendar API v3** → cocher le scope
     `https://www.googleapis.com/auth/calendar`
   - **Authorize APIs** → se connecter avec `gavrielkrief66@gmail.com` → accepter
   - **Step 2 : Exchange authorization code for tokens** → copier la valeur de **Refresh token**
5. Dans Cloudflare Pages → projet **shiourgavriel** → **Settings → Environment variables**, ajouter :
   - `GOOGLE_CLIENT_ID` = le Client ID
   - `GOOGLE_CLIENT_SECRET` = le Client Secret (cocher **Encrypt**)
   - `GOOGLE_REFRESH_TOKEN` = le refresh token obtenu (cocher **Encrypt**)
   - `GOOGLE_CALENDAR_ID` = `gavrielkrief66@gmail.com` (ou l'ID d'un agenda secondaire dédié, si préféré)

### 3. Build settings Cloudflare Pages

- Root directory : `/` (ou le sous-dossier si le repo est un monorepo)
- Build command : `npm run build`
- Build output directory : `out`

## Réglages à ajuster (constantes dans `functions/api/_shared.ts`)

- `JOURS_DISPONIBLES` — jours de la semaine ouverts à la réservation (défaut : lundi à jeudi)
- `HEURE_DEBUT` / `HEURE_FIN` — plage horaire quotidienne (défaut : 16h–20h)
- `DUREE_CRENEAU_MIN` — durée d'un créneau en minutes (défaut : 60)
- `JOURS_A_AFFICHER` — fenêtre de réservation glissante (défaut : 14 jours)

## Développement local

```bash
npm install
npm run dev      # http://localhost:3000 (page vitrine + réservation, mais /api/* ne répond
                  # qu'une fois déployé sur Cloudflare Pages, ou testé via `wrangler pages dev`)
npm run build    # génère out/
```

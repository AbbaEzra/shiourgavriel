# Shiour Gavriel — site vitrine + réservation

Site de Gabriel Krief : cours particuliers de mathématiques. Page vitrine statique (Next.js, export)
+ page de réservation connectée à Google Agenda via un Cloudflare Worker (assets statiques + API),
avec Cloudflare D1 comme garde-fou anti-double-réservation.

## Structure

```
app/                    Pages Next.js (export statique)
  page.tsx              Vitrine
  reserver/page.tsx      Réservation (client component, appelle /api/*)
worker/                  Point d'entrée Cloudflare Worker (assets + API, pas Next.js)
  index.ts               Routeur : /api/* → handlers, sinon sert out/ (ASSETS)
  shared.ts               Config créneaux + échange refresh token → access token
  availability.ts        GET  /api/availability
  book.ts                 POST /api/book
schema.sql               Schéma de la base D1 (table reservations)
wrangler.toml             Config Worker : entry point (main), assets (out/), bindings D1
```

Le projet Cloudflare est un **Worker avec assets statiques** (pas un projet "Pages" classique) :
`wrangler.toml` déclare `main = "worker/index.ts"` (le code serveur) et `[assets] directory = "./out"`
(le site statique généré par `next build`). Le Worker sert les deux : `/api/*` est intercepté par le
routeur, tout le reste tombe sur les fichiers statiques.

## Ce qu'il reste à configurer avant que la réservation fonctionne

Le site (vitrine + page réservation) est prêt à être déployé, mais **la réservation ne
fonctionnera qu'une fois ces éléments configurés côté Cloudflare** :

### 1. Base de données Cloudflare D1

1. Dashboard Cloudflare → **Workers & Pages** → **D1 SQL Database** → **Create database**
2. Nom : `shiourgavriel-db` (ou autre)
3. Une fois créée → onglet **Console** → coller le contenu de `schema.sql` → exécuter
4. Copier l'**ID de la base** (Database ID, affiché sur sa page de détail)
5. Dans `wrangler.toml`, décommenter le bloc `[[d1_databases]]` en bas du fichier et coller
   l'ID à la place de `<à remplir après création de la base>`
6. Committer et pousser ce changement (redéploiement automatique)

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
5. Dans Cloudflare, projet **shiourgavriel** → **Settings → Variables and secrets**, ajouter :
   - `GOOGLE_CLIENT_ID` = le Client ID
   - `GOOGLE_CLIENT_SECRET` = le Client Secret (type **Secret**)
   - `GOOGLE_REFRESH_TOKEN` = le refresh token obtenu (type **Secret**)
   - `GOOGLE_CALENDAR_ID` = `gavrielkrief66@gmail.com` (ou l'ID d'un agenda secondaire dédié, si préféré)

### 3. Build settings Cloudflare (Workers & Pages → shiourgavriel → Settings → Builds)

- Build command : `npm run build`
- Deploy command : `npx wrangler deploy`
- Root directory : `/`

### 4. Domaine personnalisé

Une fois le déploiement stable : **Settings → Domains → Add domain** → `shiourgavriel.com`
(le domaine est déjà chez Cloudflare, donc la connexion DNS se fait automatiquement).

## Réglages à ajuster (constantes dans `worker/shared.ts`)

- `JOURS_DISPONIBLES` — jours de la semaine ouverts à la réservation (défaut : lundi à jeudi)
- `HEURE_DEBUT` / `HEURE_FIN` — plage horaire quotidienne (défaut : 16h–20h)
- `DUREE_CRENEAU_MIN` — durée d'un créneau en minutes (défaut : 60)
- `JOURS_A_AFFICHER` — fenêtre de réservation glissante (défaut : 14 jours)

## Développement local

```bash
npm install
npm run build    # génère out/
npx wrangler dev # sert out/ + /api/* localement via le Worker (nécessite les secrets en local, voir .dev.vars)
```

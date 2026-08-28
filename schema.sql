-- Base D1 "shiourgavriel".
-- À exécuter une fois la base créée (dashboard Cloudflare : D1 > Console, ou via wrangler).

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  date_heure_debut TEXT NOT NULL,
  date_heure_fin TEXT NOT NULL,
  nom_eleve TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT NOT NULL,
  niveau TEXT NOT NULL,
  lieu TEXT NOT NULL,
  adresse TEXT,
  digicode TEXT,
  message TEXT,
  statut TEXT NOT NULL DEFAULT 'confirme', -- 'confirme' | 'annule'
  google_event_id TEXT,
  eleve_id TEXT REFERENCES eleves(id),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reservations_debut ON reservations (date_heure_debut);

-- Comptes élèves (optionnels) : mémorisent adresse/digicode/téléphone/niveau/lieu préféré
-- pour ne pas les ressaisir à chaque réservation. Connexion par lien magique (pas de mot de passe).
CREATE TABLE IF NOT EXISTS eleves (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  digicode TEXT,
  niveau TEXT,
  lieu_prefere TEXT, -- 'eleve' | 'prof' | 'zoom'
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_eleves_email ON eleves (email);

-- Liens de connexion à usage unique, envoyés par e-mail (validité courte).
CREATE TABLE IF NOT EXISTS magic_links (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

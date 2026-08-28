-- Base D1 "shiourgavriel" — table des réservations.
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
  message TEXT,
  statut TEXT NOT NULL DEFAULT 'confirme', -- 'confirme' | 'annule'
  google_event_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reservations_debut ON reservations (date_heure_debut);

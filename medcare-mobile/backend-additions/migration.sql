-- Adapter les types à ta base (SQLite / MySQL / PostgreSQL).

-- 1. Mode de consultation + lien avec l'analyse IA sur les rendez-vous
ALTER TABLE appointments ADD COLUMN mode VARCHAR(10) NOT NULL DEFAULT 'video';   -- 'video' | 'chat'
ALTER TABLE appointments ADD COLUMN triage_id INTEGER NULL;

-- 2. Messages du chat
CREATE TABLE consultation_messages (
  id             INTEGER PRIMARY KEY AUTO_INCREMENT,   -- SQLite : INTEGER PRIMARY KEY AUTOINCREMENT
  appointment_id INTEGER NOT NULL,
  sender_id      INTEGER NOT NULL,
  text           TEXT    NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_msg_appt ON consultation_messages (appointment_id, id);

-- 3. Historique des orientations IA (traçabilité, amélioration des règles)
CREATE TABLE triage_logs (
  id          INTEGER PRIMARY KEY AUTO_INCREMENT,
  patient_id  INTEGER NOT NULL,
  symptoms    TEXT NOT NULL,
  urgency     VARCHAR(12) NOT NULL,
  specialty   VARCHAR(60) NOT NULL,
  summary     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vérification des médecins (le mobile envoie licenseNumber à l'inscription)
ALTER TABLE doctors ADD COLUMN license_number VARCHAR(40);
ALTER TABLE doctors ADD COLUMN verified TINYINT NOT NULL DEFAULT 0;   -- 0 tant qu'un admin n'a pas validé

-- 5. SÉCURITÉ : /auth/register doit REFUSER role = 'admin' (création manuelle uniquement)

-- ImmoNIQ v5.2 → v5.3 · Bug-Fixes + Neue Features
-- Ausführen in Supabase SQL Editor NACH der ersten Migration

-- ─── FIX 1: Fehlende Spalten in objekte (Schema-Cache-Fehler) ───
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS baujahr int;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS kaufpreis numeric;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS zimmer numeric;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS flaeche numeric;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS bild_url text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS notizen text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS mieter_name text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS mieter_email text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS mieter_tel text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS mieter_seit date;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS kaltmiete numeric;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS nebenkosten numeric;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS kaution numeric;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS typ text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS plz text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS stadt text;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS status text;

-- Schema-Cache neu laden (das war das Hauptproblem!)
NOTIFY pgrst, 'reload schema';

-- ─── FIX 2: Bucket-Policy korrekt setzen ───
-- Lösche alten "Dokumente" Bucket manuell im UI falls vorhanden!
-- Behalte nur "dokumente" (klein)

-- Policy für Storage (falls fehlt)
DROP POLICY IF EXISTS "own files select" ON storage.objects;
DROP POLICY IF EXISTS "own files insert" ON storage.objects;
DROP POLICY IF EXISTS "own files delete" ON storage.objects;

CREATE POLICY "own files select" ON storage.objects
  FOR SELECT USING (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "own files insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "own files delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── NEU: Steuerberater-Verzeichnis (für späteren Marktplatz-Keim) ───
CREATE TABLE IF NOT EXISTS steuerberater_verzeichnis (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  kanzlei text,
  adresse text,
  plz text,
  stadt text,
  telefon text,
  email text,
  website text,
  empfehlungs_code text UNIQUE,
  schwerpunkt_immobilien boolean DEFAULT true,
  partner_status text DEFAULT 'free',  -- free, gold, featured
  notiz text,
  aktiv boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stb_verz_plz ON steuerberater_verzeichnis(plz);
CREATE INDEX IF NOT EXISTS idx_stb_verz_aktiv ON steuerberater_verzeichnis(aktiv);

-- RLS: jeder authentifizierte User darf lesen, aber nur Service-Role darf schreiben
ALTER TABLE steuerberater_verzeichnis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read verzeichnis" ON steuerberater_verzeichnis;
CREATE POLICY "public read verzeichnis" ON steuerberater_verzeichnis
  FOR SELECT USING (aktiv = true);

-- Beispiel-Einträge (du kannst die später löschen/ersetzen)
INSERT INTO steuerberater_verzeichnis (name, kanzlei, stadt, plz, email, website, schwerpunkt_immobilien, partner_status, notiz)
VALUES
  ('Max Mustermann', 'Mustermann & Partner', 'Münster', '48143', 'info@mustermann-stb.de', 'https://mustermann-stb.de', true, 'free', 'Partner seit 2026'),
  ('Dr. Anna Schmidt', 'Schmidt Steuerberatung', 'Warendorf', '48231', 'kontakt@schmidt-stb.de', 'https://schmidt-stb.de', true, 'free', NULL),
  ('Klaus Weber', 'Weber GmbH Steuerberater', 'Beckum', '59269', 'info@weber-stb.de', NULL, true, 'free', NULL)
ON CONFLICT DO NOTHING;

-- ─── NEU: Vertragsvorlagen-Verzeichnis (Keim für Generator-Feature) ───
CREATE TABLE IF NOT EXISTS vertragsvorlagen (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titel text NOT NULL,
  beschreibung text,
  kategorie text,  -- mietvertrag, kuendigung, nk_abrechnung, uebergabe, etc.
  quelle text,  -- "Haus & Grund", "Mieterbund", "IHK", etc.
  url text,
  format text DEFAULT 'pdf',  -- pdf, docx, online
  kostenlos boolean DEFAULT true,
  preis numeric,
  sortierung int DEFAULT 0,
  aktiv boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vertragsvorlagen ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read vorlagen" ON vertragsvorlagen;
CREATE POLICY "public read vorlagen" ON vertragsvorlagen
  FOR SELECT USING (aktiv = true);

INSERT INTO vertragsvorlagen (titel, beschreibung, kategorie, quelle, url, format, kostenlos, sortierung) VALUES
  ('Mietvertrag für Wohnraum (Haus & Grund)', 'Rechtssicherer Standard-Mietvertrag vom Eigentümerverband, regelmäßig BGH-aktualisiert', 'mietvertrag', 'Haus & Grund', 'https://www.hausundgrund.de/mietrecht/mietvertraege', 'pdf', false, 1),
  ('Mietvertrag Wohnraum (Mieterbund-Muster)', 'Alternative Vorlage vom Deutschen Mieterbund', 'mietvertrag', 'Deutscher Mieterbund', 'https://www.mieterbund.de', 'pdf', false, 2),
  ('Übergabeprotokoll bei Einzug', 'Standardprotokoll für Wohnungsübergabe — rechtssicher', 'uebergabe', 'Haus & Grund', 'https://www.hausundgrund.de/mietrecht/formulare', 'pdf', false, 3),
  ('Kündigungsschreiben (Mieter/Vermieter)', 'Vorlagen für ordentliche & außerordentliche Kündigung', 'kuendigung', 'Mieterbund', 'https://www.mieterbund.de/service/muster-briefe.html', 'docx', true, 4),
  ('Mieterhöhungsschreiben (§ 558 BGB)', 'Rechtssichere Mieterhöhung zur ortsüblichen Vergleichsmiete', 'mieterhoehung', 'Haus & Grund', 'https://www.hausundgrund.de', 'pdf', false, 5),
  ('Nebenkostenabrechnung (Muster)', 'BetrKV-konforme Vorlage für manuelle Abrechnung (als Ergänzung zum ImmoNIQ-Tool)', 'nk_abrechnung', 'IHK NRW', 'https://www.ihk.de', 'xlsx', true, 6),
  ('Hausordnung (Standard)', 'Rechtssichere Hausordnung für Mehrfamilienhaus', 'hausordnung', 'Haus & Grund', 'https://www.hausundgrund.de', 'pdf', false, 7),
  ('Selbstauskunft (Mietbewerber)', 'Formular für Mietinteressenten bei Wohnungsbewerbung', 'selbstauskunft', 'Immowelt', 'https://www.immowelt.de/ratgeber/vermieten/selbstauskunft-mieter', 'pdf', true, 8)
ON CONFLICT DO NOTHING;

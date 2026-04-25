-- ImmoNIQ v5 → v5.1 · Minimal Steuerberater-Integration
-- Run in Supabase SQL Editor nach v5 SCHEMA.sql
-- Dauer: ~5 Sekunden

-- ─── Tabelle: Steuerberater (zum Kontakt-Speichern pro Vermieter) ───
create table if not exists steuerberater (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  kanzlei text,
  email text not null,
  telefon text,
  empfehlungs_code text,    -- falls über StB gekommen
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_stb_user on steuerberater(user_id);

alter table steuerberater enable row level security;

drop policy if exists "stb own" on steuerberater;
create policy "stb own" on steuerberater
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Optional: Empfehlungs-Code beim Vermieter speichern ───
-- (als Metadaten in auth.users.raw_user_meta_data — keine Schema-Änderung nötig)

-- ─── Log-Tabelle: Wann wurde an StB gesendet ───
create table if not exists steuerberater_exports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stb_email text not null,
  jahr int not null,
  gesendet_at timestamptz default now()
);

create index if not exists idx_stb_export_user on steuerberater_exports(user_id);

alter table steuerberater_exports enable row level security;

drop policy if exists "stb export own" on steuerberater_exports;
create policy "stb export own" on steuerberater_exports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

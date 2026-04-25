-- ImmoNIQ v4 - Complete Schema
-- Run in Supabase SQL Editor → New Query → Run

-- ─── TABLES ───────────────────────────────────────────

create table if not exists objekte (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text, adresse text not null, plz text, stadt text,
  bundesland text default 'NRW', flaeche numeric, zimmer numeric,
  etage text, typ text default 'Wohnung', baujahr integer,
  kaufpreis numeric, kaufdatum date,
  kaltmiete numeric default 0, nebenkosten numeric default 0,
  mieter_name text, mieter_email text, mieter_tel text,
  mieter_seit date, kaution numeric default 0,
  status text default 'leer', bild_url text, notizen text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists aufgaben (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  objekt_id uuid references objekte(id) on delete set null,
  text text not null, faellig date,
  prioritaet text default 'g',
  erledigt boolean default false,
  typ text default 'manuell',
  gesetz text,
  created_at timestamptz default now()
);

create table if not exists zahlungen (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  objekt_id uuid references objekte(id) on delete set null,
  betrag numeric not null, monat text,
  status text default 'ok',
  notiz text, typ text default 'miete',
  created_at timestamptz default now()
);

create table if not exists nachrichten (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  objekt_id uuid references objekte(id) on delete set null,
  mieter_name text, betreff text, text text,
  gelesen boolean default false,
  created_at timestamptz default now()
);

create table if not exists sanierungen (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  objekt_id uuid references objekte(id) on delete cascade not null,
  typ text not null, datum date, kosten numeric,
  beschreibung text, handwerker text,
  created_at timestamptz default now()
);

create table if not exists dokumente (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  objekt_id uuid references objekte(id) on delete set null,
  name text not null,
  typ text default 'sonstiges',
  url text,
  storage_path text,
  groesse text,
  notiz text,
  verschluesselt boolean default false,
  created_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────

alter table objekte enable row level security;
alter table aufgaben enable row level security;
alter table zahlungen enable row level security;
alter table nachrichten enable row level security;
alter table sanierungen enable row level security;
alter table dokumente enable row level security;

-- Drop existing policies first (safe to re-run)
drop policy if exists "own_objekte" on objekte;
drop policy if exists "own_aufgaben" on aufgaben;
drop policy if exists "own_zahlungen" on zahlungen;
drop policy if exists "own_nachrichten" on nachrichten;
drop policy if exists "own_sanierungen" on sanierungen;
drop policy if exists "own_dokumente" on dokumente;

-- Create policies
create policy "own_objekte" on objekte for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_aufgaben" on aufgaben for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_zahlungen" on zahlungen for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_nachrichten" on nachrichten for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_sanierungen" on sanierungen for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_dokumente" on dokumente for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── STORAGE BUCKET (Dokumenten-Tresor) ───────────────
-- Run this separately if the above works:

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dokumente',
  'dokumente',
  false,
  52428800, -- 50MB limit
  array['application/pdf','image/jpeg','image/png','image/webp','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do nothing;

-- Storage RLS
drop policy if exists "own_storage" on storage.objects;
create policy "own_storage" on storage.objects
  for all using (bucket_id = 'dokumente' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'dokumente' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─── INDEXES (Performance) ────────────────────────────
create index if not exists idx_objekte_user on objekte(user_id);
create index if not exists idx_aufgaben_user on aufgaben(user_id, erledigt);
create index if not exists idx_zahlungen_user on zahlungen(user_id);
create index if not exists idx_nachrichten_user on nachrichten(user_id, gelesen);
create index if not exists idx_dokumente_user on dokumente(user_id);
create index if not exists idx_sanierungen_objekt on sanierungen(objekt_id);

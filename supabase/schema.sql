-- Lentera Malam: jalankan seluruh isi file ini sekali di Supabase → SQL Editor → New query → Run.

-- Progres, streak, favorit, mode, nama panggilan, pengaturan notifikasi (satu baris per pengguna)
create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Jurnal refleksi (satu baris per pengguna per tanggal)
create table if not exists public.journals (
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  text text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- Langganan notifikasi Web Push (satu baris per perangkat)
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- Row Level Security: setiap pengguna hanya dapat membaca dan menulis datanya sendiri
alter table public.user_state enable row level security;
alter table public.journals enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "user_state milik sendiri" on public.user_state;
create policy "user_state milik sendiri" on public.user_state
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "journals milik sendiri" on public.journals;
create policy "journals milik sendiri" on public.journals
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "push milik sendiri" on public.push_subscriptions;
create policy "push milik sendiri" on public.push_subscriptions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

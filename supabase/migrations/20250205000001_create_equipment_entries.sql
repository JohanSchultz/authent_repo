-- Equipment entries: store equipment type, service minutes, and IsActive per user.
-- Run in Supabase SQL Editor or via Supabase CLI.

create table public.equipment_entries (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  equipment_type text not null,
  service_minutes integer,
  "IsActive" boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (id)
);

comment on table public.equipment_entries is 'Saved equipment type and service minutes per user.';

alter table public.equipment_entries enable row level security;

create policy "Users can insert own equipment entries"
  on public.equipment_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can select own equipment entries"
  on public.equipment_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can update own equipment entries"
  on public.equipment_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own equipment entries"
  on public.equipment_entries
  for delete
  using (auth.uid() = user_id);

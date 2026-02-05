-- Profiles table: 1-to-1 with auth.users
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) or via Supabase CLI.

-- Table: one row per user, id matches auth.users(id)
create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

comment on table public.profiles is 'User profiles; one row per auth.users row.';

-- Trigger: create a profile row whenever a new user is created in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Row Level Security: users can only read and update their own profile
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT policy for authenticated users: profiles are created only by the trigger.
-- No DELETE policy: if you want users to delete their own profile, add:
-- create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

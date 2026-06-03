create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  default_hourly_rate numeric not null default 0 check (default_hourly_rate >= 0),
  currency text not null default 'VND',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  note text,
  default_hourly_rate numeric not null default 0 check (default_hourly_rate >= 0),
  currency text not null default 'VND',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  name text not null,
  description text,
  hourly_rate numeric not null default 0 check (hourly_rate >= 0),
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  is_billable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  hourly_rate numeric not null default 0 check (hourly_rate >= 0),
  amount numeric not null default 0 check (amount >= 0),
  is_billable boolean not null default true,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists time_entries_user_id_entry_date_idx on public.time_entries(user_id, entry_date);
create index if not exists time_entries_project_id_idx on public.time_entries(project_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_time_entries_updated_at on public.time_entries;
create trigger set_time_entries_updated_at
before update on public.time_entries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
for delete using (auth.uid() = id);

drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own" on public.clients
for select using (auth.uid() = user_id);

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own" on public.clients
for insert with check (auth.uid() = user_id);

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own" on public.clients
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "clients_delete_own" on public.clients;
create policy "clients_delete_own" on public.clients
for delete using (auth.uid() = user_id);

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own" on public.projects
for select using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
for insert with check (
  auth.uid() = user_id
  and (
    client_id is null
    or exists (
      select 1 from public.clients
      where clients.id = projects.client_id
      and clients.user_id = auth.uid()
    )
  )
);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
for update using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    client_id is null
    or exists (
      select 1 from public.clients
      where clients.id = projects.client_id
      and clients.user_id = auth.uid()
    )
  )
);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
for delete using (auth.uid() = user_id);

drop policy if exists "time_entries_select_own" on public.time_entries;
create policy "time_entries_select_own" on public.time_entries
for select using (auth.uid() = user_id);

drop policy if exists "time_entries_insert_own" on public.time_entries;
create policy "time_entries_insert_own" on public.time_entries
for insert with check (
  auth.uid() = user_id
  and description is not null
  and length(trim(description)) > 0
  and project_id is not null
  and exists (
    select 1 from public.projects
    where projects.id = time_entries.project_id
    and projects.user_id = auth.uid()
  )
  and (
    client_id is null
    or exists (
      select 1 from public.clients
      where clients.id = time_entries.client_id
      and clients.user_id = auth.uid()
    )
  )
);

drop policy if exists "time_entries_update_own" on public.time_entries;
create policy "time_entries_update_own" on public.time_entries
for update using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and description is not null
  and length(trim(description)) > 0
  and project_id is not null
  and duration_minutes >= 0
  and hourly_rate >= 0
);

drop policy if exists "time_entries_delete_own" on public.time_entries;
create policy "time_entries_delete_own" on public.time_entries
for delete using (auth.uid() = user_id);

-- Mission Control core schema
create extension if not exists pgcrypto;

create table if not exists mc_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null check (status in ('backlog','doing','review','done')),
  owner text,
  priority text default 'medium',
  created_at timestamptz default now()
);

create table if not exists mc_activity (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  actor text,
  created_at timestamptz default now()
);

create table if not exists mc_calendar_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  run_time timestamptz,
  job_type text,
  created_at timestamptz default now()
);

create table if not exists mc_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  focus text,
  progress int default 0,
  created_at timestamptz default now()
);

create table if not exists mc_memory_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  content text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists mc_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  content text,
  created_at timestamptz default now()
);

create table if not exists mc_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null,
  status text not null default 'online',
  theme text default 'one-piece',
  created_at timestamptz default now()
);

alter table mc_tasks enable row level security;
alter table mc_activity enable row level security;
alter table mc_calendar_jobs enable row level security;
alter table mc_projects enable row level security;
alter table mc_memory_entries enable row level security;
alter table mc_docs enable row level security;
alter table mc_agents enable row level security;

create policy "allow read anon" on mc_tasks for select using (true);
create policy "allow read anon" on mc_activity for select using (true);
create policy "allow read anon" on mc_calendar_jobs for select using (true);
create policy "allow read anon" on mc_projects for select using (true);
create policy "allow read anon" on mc_memory_entries for select using (true);
create policy "allow read anon" on mc_docs for select using (true);
create policy "allow read anon" on mc_agents for select using (true);

-- service role bypasses RLS automatically for writes.

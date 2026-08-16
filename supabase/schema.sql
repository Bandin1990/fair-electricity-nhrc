-- Fair Electricity project content database

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('media','event','document','proposal')),
  title text not null,
  summary text not null default '',
  cover_url text,
  source_url text,
  storage_path text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_items_status_idx on public.content_items(status);
create index if not exists content_items_kind_idx on public.content_items(kind);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  date_label text not null default '',
  title text not null,
  audience text not null default '',
  location text not null default '',
  participants_label text not null default '',
  detail text not null default '',
  cover_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists activities_status_idx on public.activities(status);

create table if not exists public.activity_attachments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  label text not null,
  kind text not null check (kind in ('summary','image','supporting','reference')),
  file_url text,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists activity_attachments_activity_idx on public.activity_attachments(activity_id);

create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  note text not null default '',
  image_url text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists committee_members_status_idx on public.committee_members(status);

create table if not exists public.project_background (
  id text primary key default 'main' check (id = 'main'),
  title text not null default 'ความเป็นมา [ต่อ]',
  facts jsonb not null default '[]'::jsonb,
  closing text not null default '',
  status text not null default 'published' check (status in ('draft','published','archived')),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_survey (
  id text primary key default 'main' check (id = 'main'),
  title text not null default 'ผลสำรวจสาธารณะ',
  intro text not null default '',
  highlights jsonb not null default '[]'::jsonb,
  source_url text not null default '',
  status text not null default 'published' check (status in ('draft','published','archived')),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_metrics (
  id text primary key,
  label text not null,
  value text not null,
  detail text not null default '',
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_points (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists proposal_points_status_idx on public.proposal_points(status, sort_order);

create table if not exists public.proposal_measures (
  id uuid primary key default gen_random_uuid(),
  point_order integer not null,
  category_title text not null default '',
  item_no integer not null default 0,
  title text not null,
  agencies text not null default '',
  timeframe text not null default 'ระยะสั้น' check (timeframe in ('ระยะสั้น','ระยะกลาง','ระยะยาว')),
  detail text not null default '',
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists proposal_measures_public_idx on public.proposal_measures(status, point_order, sort_order);

alter table public.admin_users enable row level security;
alter table public.content_items enable row level security;
alter table public.activities enable row level security;
alter table public.activity_attachments enable row level security;
alter table public.committee_members enable row level security;
alter table public.project_background enable row level security;
alter table public.project_survey enable row level security;
alter table public.project_metrics enable row level security;
alter table public.proposal_points enable row level security;
alter table public.proposal_measures enable row level security;

drop policy if exists "admins can read own admin row" on public.admin_users;
drop policy if exists "public can read published content" on public.content_items;
drop policy if exists "public can read published activities" on public.activities;
drop policy if exists "public can read attachments for published activities" on public.activity_attachments;
drop policy if exists "public can read published committee" on public.committee_members;
drop policy if exists "public can read published background" on public.project_background;
drop policy if exists "public can read published survey" on public.project_survey;
drop policy if exists "public can read published metrics" on public.project_metrics;
drop policy if exists "public can read published proposal points" on public.proposal_points;
drop policy if exists "public can read published proposal measures" on public.proposal_measures;
drop policy if exists "admins can manage content" on public.content_items;
drop policy if exists "admins can manage activities" on public.activities;
drop policy if exists "admins can manage attachments" on public.activity_attachments;
drop policy if exists "admins can manage committee" on public.committee_members;
drop policy if exists "admins can manage background" on public.project_background;
drop policy if exists "admins can manage survey" on public.project_survey;
drop policy if exists "admins can manage metrics" on public.project_metrics;
drop policy if exists "admins can manage proposal points" on public.proposal_points;
drop policy if exists "admins can manage proposal measures" on public.proposal_measures;

create policy "admins can read own admin row" on public.admin_users for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "public can read published content" on public.content_items for select to anon, authenticated using (status = 'published');
create policy "public can read published activities" on public.activities for select to anon, authenticated using (status = 'published');
create policy "public can read attachments for published activities" on public.activity_attachments for select to anon, authenticated
  using (exists (select 1 from public.activities a where a.id = activity_id and a.status = 'published'));
create policy "public can read published committee" on public.committee_members for select to anon, authenticated using (status = 'published');
create policy "public can read published background" on public.project_background for select to anon, authenticated using (status = 'published');
create policy "public can read published survey" on public.project_survey for select to anon, authenticated using (status = 'published');
create policy "public can read published metrics" on public.project_metrics for select to anon, authenticated using (status = 'published');
create policy "public can read published proposal points" on public.proposal_points for select to anon, authenticated using (status = 'published');
create policy "public can read published proposal measures" on public.proposal_measures for select to anon, authenticated using (status = 'published');

create policy "admins can manage content" on public.content_items for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage activities" on public.activities for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage attachments" on public.activity_attachments for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage committee" on public.committee_members for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage background" on public.project_background for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage survey" on public.project_survey for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage metrics" on public.project_metrics for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage proposal points" on public.proposal_points for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can manage proposal measures" on public.proposal_measures for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

insert into public.project_background (id, title, facts, closing, status)
values ('main', 'ความเป็นมา [ต่อ]', '[]'::jsonb, '', 'published')
on conflict (id) do nothing;

insert into public.project_survey (id, title, intro, highlights, source_url, status)
values ('main', 'ผลสำรวจสาธารณะ', '', '[]'::jsonb, '', 'published')
on conflict (id) do nothing;

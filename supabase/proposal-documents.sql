-- ตารางใหม่สำหรับรายการเอกสารในส่วนข้อเสนอแนะฉบับสมบูรณ์
-- ไม่กระทบ content_items หรือข้อมูลเดิมของเว็บไซต์
create table if not exists public.proposal_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  file_url text not null,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposal_documents enable row level security;

drop policy if exists "public can read published proposal documents" on public.proposal_documents;
drop policy if exists "admins can manage proposal documents" on public.proposal_documents;

create policy "public can read published proposal documents" on public.proposal_documents
  for select to anon, authenticated using (status = 'published');

create policy "admins can manage proposal documents" on public.proposal_documents
  for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

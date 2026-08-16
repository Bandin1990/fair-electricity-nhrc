-- Supabase Storage สำหรับไฟล์ที่จัดการจาก /admin
-- รันหลัง supabase/schema.sql ใน SQL Editor

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read site media" on storage.objects;
drop policy if exists "admins can upload site media" on storage.objects;
drop policy if exists "admins can update site media" on storage.objects;
drop policy if exists "admins can delete site media" on storage.objects;

create policy "public can read site media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-media');

create policy "admins can upload site media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-media'
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

create policy "admins can update site media" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'site-media'
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  )
  with check (bucket_id = 'site-media');

create policy "admins can delete site media" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'site-media'
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

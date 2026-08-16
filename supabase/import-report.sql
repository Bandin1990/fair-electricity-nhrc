-- Import the final implementation report and regional presentation decks.
-- Run after supabase/schema.sql in Supabase SQL Editor.

create table if not exists public.project_metrics (
  id text primary key,
  label text not null,
  value text not null,
  detail text not null default '',
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  updated_at timestamptz not null default now()
);
alter table public.project_metrics enable row level security;
drop policy if exists "public can read published metrics" on public.project_metrics;
drop policy if exists "admins can manage metrics" on public.project_metrics;
create policy "public can read published metrics" on public.project_metrics for select to anon, authenticated using (status = 'published');
create policy "admins can manage metrics" on public.project_metrics for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

delete from public.project_metrics where id in ('participants', 'survey-samples', 'public-media', 'reach', 'contract-budget', 'actual-expense');
insert into public.project_metrics (id, label, value, detail, sort_order, status) values ('participants', 'ผู้เข้าร่วมกิจกรรม', '781', 'คน-ครั้ง', 1, 'published');
insert into public.project_metrics (id, label, value, detail, sort_order, status) values ('survey-samples', 'ตัวอย่างแบบสำรวจ', '5,130', 'ภาคสนามและออนไลน์', 2, 'published');
insert into public.project_metrics (id, label, value, detail, sort_order, status) values ('public-media', 'สื่อสาธารณะ', '46', 'ชิ้น/รายการ', 3, 'published');

-- Seed the complete committee roster and the corresponding cropped portraits from the supplied project artwork.
delete from public.committee_members where name in (
  'สยามล ไกยูรวงศ์', 'ชาญเชาวน์ ไชยานุกิจ', 'ประวิทย์ ลี่สถาพรวงศา', 'ปิติ เอี่ยมจำรูญลาภ',
  'อารีพร อัศวินพงศ์พันธ์', 'รัตติกุล จันทร์สุริยา', 'จุมพล ขุนอ่อน', 'พิมพ์ดาว จันทร์ธนธัย',
  'ศิรสาดา ผิวหอม', 'บัณฑิต หอมเกษ'
);
insert into public.committee_members (name, role, image_url, sort_order, status) values
  ('สยามล ไกยูรวงศ์', 'ที่ปรึกษาคณะอนุกรรมการ', '/media/committee-1.jpg', 1, 'published'),
  ('ชาญเชาวน์ ไชยานุกิจ', 'ประธานคณะอนุกรรมการ', '/media/committee-2.jpg', 2, 'published'),
  ('ประวิทย์ ลี่สถาพรวงศา', 'อนุกรรมการ', '/media/committee-3.jpg', 3, 'published'),
  ('ปิติ เอี่ยมจำรูญลาภ', 'อนุกรรมการ', '/media/committee-4.jpg', 4, 'published'),
  ('อารีพร อัศวินพงศ์พันธ์', 'อนุกรรมการ', '/media/committee-5.jpg', 5, 'published'),
  ('รัตติกุล จันทร์สุริยา', 'อนุกรรมการ', '/media/committee-6.jpg', 6, 'published'),
  ('จุมพล ขุนอ่อน', 'อนุกรรมการ', '/media/committee-7.jpg', 7, 'published'),
  ('พิมพ์ดาว จันทร์ธนธัย', 'เลขานุการ', '/media/committee-8.jpg', 8, 'published'),
  ('ศิรสาดา ผิวหอม', 'ผู้ช่วยเลขานุการ', '/media/committee-9.jpg', 9, 'published'),
  ('บัณฑิต หอมเกษ', 'ผู้ช่วยเลขานุการ', '/media/committee-10.jpg', 10, 'published');

delete from public.content_items where source_url in (
  '/docs/รายงานผลการดำเนินการและรายงานค่าใช้จ่าย.docx',
  '/docs/เอกสารนำเสนอ-กทม-กลาง-ตะวันออก-ตะวันตก.pdf',
  '/docs/เอกสารนำเสนอ-ภาคเหนือ.pdf',
  '/docs/เอกสารนำเสนอ-ภาคใต้.pdf'
);

insert into public.content_items (kind, title, summary, source_url, storage_path, status, published_at)
values
  ('document', 'รายงานผลการดำเนินการและรายงานค่าใช้จ่าย', 'สรุปผลการดำเนินกิจกรรม การสื่อสารสาธารณะ การบริหารงบประมาณ และความเสี่ยงของโครงการ', '/docs/รายงานผลการดำเนินการและรายงานค่าใช้จ่าย.docx', 'รายงานผลการดำเนินการและรายงานค่าใช้จ่าย.docx', 'published', now()),
  ('document', 'เอกสารนำเสนอเวที กทม. ภาคกลาง ตะวันออก และตะวันตก', 'เอกสารประกอบเวทีรับฟังความคิดเห็นระดับภูมิภาค', '/docs/เอกสารนำเสนอ-กทม-กลาง-ตะวันออก-ตะวันตก.pdf', 'เอกสารนำเสนอ-กทม-กลาง-ตะวันออก-ตะวันตก.pdf', 'published', now()),
  ('document', 'เอกสารนำเสนอเวทีภาคเหนือ', 'เอกสารประกอบเวทีรับฟังความคิดเห็นภาคเหนือ', '/docs/เอกสารนำเสนอ-ภาคเหนือ.pdf', 'เอกสารนำเสนอ-ภาคเหนือ.pdf', 'published', now()),
  ('document', 'เอกสารนำเสนอเวทีภาคใต้', 'เอกสารประกอบเวทีรับฟังความคิดเห็นภาคใต้', '/docs/เอกสารนำเสนอ-ภาคใต้.pdf', 'เอกสารนำเสนอ-ภาคใต้.pdf', 'published', now());

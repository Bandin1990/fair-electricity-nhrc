-- Import the public opinion poll summary and full report link.
-- Run after supabase/schema.sql and before using the survey editor in /admin.

create table if not exists public.project_survey (
  id text primary key check (id = 'main'),
  title text not null,
  intro text not null default '',
  highlights jsonb not null default '[]'::jsonb,
  source_url text not null default '/docs/Electricity-Poll-Report.docx',
  status text not null default 'published' check (status in ('draft','published','archived')),
  updated_at timestamptz not null default now()
);
alter table public.project_survey enable row level security;
drop policy if exists "public can read published survey" on public.project_survey;
drop policy if exists "admins can manage survey" on public.project_survey;
create policy "public can read published survey" on public.project_survey for select to anon, authenticated using (status = 'published');
create policy "admins can manage survey" on public.project_survey for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

delete from public.project_survey where id = 'main';
insert into public.project_survey (id, title, intro, highlights, source_url, status) values (
  'main',
  'ผลสำรวจสาธารณะ',
  'สำรวจความคิดเห็นประชาชนทั่วประเทศ เพื่อทำความเข้าใจภาระค่าไฟฟ้า ผลกระทบต่อการดำรงชีวิต การเข้าถึงมาตรการช่วยเหลือ และความต้องการต่อแนวทางแก้ไขเชิงนโยบาย',
  '[
    "มีผู้ตอบแบบสอบถาม 5,130 ตัวอย่าง สูงกว่าเป้าหมาย 5,000 ตัวอย่าง ครอบคลุม 77 จังหวัด แบ่งเป็นภาคสนาม 4,050 ตัวอย่าง และออนไลน์ 1,080 ตัวอย่าง",
    "ค่าไฟฟ้าอยู่ในกลุ่มค่าใช้จ่ายภาระสูง 3 อันดับแรกของทุกภูมิภาค โดยอยู่ลำดับที่ 2 ในภาคตะวันออกเฉียงเหนือ ภาคใต้ และกรุงเทพมหานคร/ภาคกลาง",
    "กลุ่มรายได้ต่ำกว่า 25,000 บาท ให้คะแนนความแพงของค่าไฟฟ้าสูงกว่ากลุ่มรายได้สูงกว่า (4.142 เทียบกับ 3.953) สะท้อนภาระเชิงสัดส่วนที่กระทบครัวเรือนรายได้น้อยมากกว่า",
    "การรับรู้มาตรการค่าไฟแบบแปรผันตามช่วงเวลา (TOU) ยังมีจำกัด: รู้จักและใช้งาน 5.96% รู้จักแต่ยังไม่ใช้ 18.36% และไม่รู้จัก 75.67%",
    "เสียงสะท้อนจากแบบสอบถามชี้ให้เห็นความต้องการทั้งการปรับโครงสร้างค่าไฟให้เป็นธรรม การเปิดเผยข้อมูลต้นทุน และมาตรการที่ช่วยให้ประชาชนเข้าถึงสิทธิได้จริง"
  ]'::jsonb,
  '/docs/Electricity-Poll-Report.docx',
  'published'
);

delete from public.content_items where source_url = '/docs/Electricity-Poll-Report.docx';
insert into public.content_items (kind, title, summary, source_url, storage_path, status, published_at)
values ('document', 'รายงานผลสำรวจความคิดเห็นสาธารณะเรื่องค่าไฟฟ้า', 'รายงานฉบับเต็มของการสำรวจความคิดเห็นประชาชนเกี่ยวกับภาระค่าไฟฟ้า ผลกระทบ และความต้องการเชิงนโยบาย', '/docs/Electricity-Poll-Report.docx', 'Electricity-Poll-Report.docx', 'published', now());

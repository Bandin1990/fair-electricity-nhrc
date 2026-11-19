-- เพิ่มช่องลิงก์ที่มาและข่าวสารโครงการให้ฐานข้อมูลเดิมแบบปลอดภัยและรันซ้ำได้
alter table public.project_background
  add column if not exists source_url text not null default 'https://www.nhrc.or.th/th/electricity';

update public.project_background
set source_url = 'https://www.nhrc.or.th/th/electricity'
where id = 'main' and (source_url is null or btrim(source_url) = '');

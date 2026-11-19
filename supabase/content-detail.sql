-- แยกคำโปรยบนการ์ดออกจากรายละเอียดใน modal
alter table public.content_items
  add column if not exists detail text not null default '';

-- ข้อมูลเดิมยังคงใช้ได้: ถ้ายังไม่มีรายละเอียด ให้ใช้คำโปรยเดิมเป็นค่าเริ่มต้น
update public.content_items
set detail = summary
where kind = 'proposal'
  and (detail is null or detail = '');

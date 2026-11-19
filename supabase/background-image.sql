-- เพิ่มภาพประกอบในส่วนความเป็นมาของโครงการ โดยไม่กระทบข้อมูลเดิม
alter table public.project_background
  add column if not exists image_url text not null default '';

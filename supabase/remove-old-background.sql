-- ลบข้อความความเป็นมาโครงการชุดเดิมตามที่ร้องขอ
-- คงหัวข้อ ภาพ ลิงก์ และข้อมูลส่วนอื่นไว้
update public.project_background
set facts = '[]'::jsonb,
    closing = '',
    updated_at = now()
where id = 'main';

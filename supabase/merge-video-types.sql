-- รวมประเภทคลิปวิชาการเข้ากับประเภทวิดีโอ
-- ไม่ลบ URL ชื่อเรื่อง คำอธิบาย หรือข้อมูลสถิติของรายการเดิม
update public.content_items
set media_type = 'วิดีโอ', updated_at = now()
where kind = 'media'
  and media_type = 'คลิปวิชาการ';

-- เพิ่มลำดับการแสดงผลกิจกรรมให้จัดเรียงได้จากระบบหลังบ้าน
alter table public.activities
  add column if not exists sort_order integer not null default 0;

create index if not exists activities_sort_order_idx
  on public.activities(sort_order, created_at desc);

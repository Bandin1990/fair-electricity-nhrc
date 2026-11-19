-- ลบเฉพาะโปสเตอร์ประชาสัมพันธ์งานจาก Index_removed.pdf
-- ไม่กระทบวิดีโอ คลิป อินโฟกราฟิก อัลบั้มภาพ หรือข้อมูลหมวดอื่น
delete from public.content_items
where kind = 'media'
  and source_url in (
    'https://www.facebook.com/share/p/1B5YaL8yhX/',
    'https://www.facebook.com/share/p/1GdxQSPBCa/',
    'https://www.facebook.com/photo.php?fbid=1236489372004789&set=pb.100069312125516.-2207520000&type=3',
    'https://www.facebook.com/photo.php?fbid=1248204077499985&set=pb.100069312125516.-2207520000&type=3',
    'https://www.facebook.com/photo.php?fbid=1259321446388248&set=pb.100069312125516.-2207520000&type=3',
    'https://www.facebook.com/photo.php?fbid=1271253708528355&set=pb.100069312125516.-2207520000&type=3',
    'https://www.facebook.com/photo.php?fbid=1349186294068429&set=pb.100069312125516.-2207520000&type=3'
  );

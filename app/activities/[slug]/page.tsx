import { notFound } from "next/navigation";
import Link from "next/link";
import { activities } from "../../../lib/content";
import "./detail.css";

export function generateStaticParams() {
  return activities.map((activity) => ({ slug: activity.slug }));
}

export default async function ActivityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = activities.find((item) => item.slug === slug);
  if (!activity) notFound();

  return <main className="activity-page">
    <nav className="activity-nav"><Link href="/" className="activity-brand"><span className="nhrc-mark">กสม.</span><span><b>ค่าไฟแฟร์</b><small>ค่าไฟแฟร์ คือค่าไฟที่แคร์ประชาชน</small></span></Link><Link href="/#journey">← กลับไปการดำเนินงาน</Link></nav>
    <article className="activity-detail shell">
      <div className="activity-kicker">กิจกรรมรับฟังความคิดเห็น / {activity.date}</div>
      <h1>{activity.title}</h1>
      <div className="activity-facts"><span>{activity.audience}</span><span>{activity.location}</span><span>{activity.participants}</span></div>
      <div className="activity-layout"><div><img src={activity.image} alt={`ภาพประกอบ ${activity.title}`} className="activity-image" /><small className="image-note">ภาพประกอบกิจกรรมจากเอกสารโครงการ</small></div><div className="activity-copy"><h2>รายละเอียดกิจกรรม</h2><p>{activity.detail}</p><p>ข้อมูลจากกิจกรรมนี้ถูกรวบรวมร่วมกับการศึกษาเอกสารและการรับฟังความคิดเห็นจากหลายภาคส่วน เพื่อใช้ประกอบการจัดทำข้อเสนอแนะของ กสม.</p><div className="attachment-list"><h2>เอกสารและสื่อประกอบ</h2>{activity.attachments.map((file) => <a href={file.href} target="_blank" rel="noreferrer" key={file.label}><span>{file.kind}</span><b>{file.label}</b><strong>↗</strong></a>)}</div></div></div>
    </article>
  </main>;
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { activities as fallbackActivities, type Activity } from "../../../lib/content";
import "./detail.css";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
type ManagedActivity = { id: string; slug: string; date_label: string; title: string; audience: string; location: string; participants_label: string; detail: string; cover_url: string | null };
type ManagedAttachment = { id: string; label: string; kind: string; file_url: string; storage_path?: string | null };
function isImageAttachment(item: { kind: string; file_url: string; storage_path?: string | null }) {
  return item.kind.toLowerCase() === "image" || item.kind === "ภาพกิจกรรม" || /\.(jpe?g|png|gif|webp|avif)(?:\?|$)/i.test(`${item.file_url} ${item.storage_path ?? ""}`);
}
function cleanAttachmentLabel(label: string) {
  const value = label.trim();
  return ["ไฟล์แนบ", "ภาพกิจกรรม", "image"].includes(value.toLowerCase()) ? "" : value;
}
function attachmentKindLabel(kind: string) {
  if (kind === "summary") return "บันทึกประชุม";
  if (kind === "supporting") return "เอกสารนำเสนอวิทยากร";
  if (kind === "reference") return "เอกสารอ้างอิง";
  return "สื่อประกอบ";
}

export function generateStaticParams() {
  return fallbackActivities.map((activity) => ({ slug: activity.slug }));
}

async function loadActivity(slug: string): Promise<{ activity: Activity; gallery: ManagedAttachment[] }> {
  const decodedSlug = decodeURIComponent(slug);
  const fallback = fallbackActivities.find((item) => item.slug === decodedSlug);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const response = await fetch(`${url}/rest/v1/activities?slug=eq.${encodeURIComponent(decodedSlug)}&status=eq.published&select=id,slug,date_label,title,audience,location,participants_label,detail,cover_url`, { headers, cache: "no-store" });
    const rows = response.ok ? await response.json() as ManagedActivity[] : [];
    const row = rows[0];
    if (row) {
      const attachmentsResponse = await fetch(`${url}/rest/v1/activity_attachments?activity_id=eq.${row.id}&select=id,label,kind,file_url,storage_path&order=sort_order.asc`, { headers, cache: "no-store" });
      const attachments = attachmentsResponse.ok ? await attachmentsResponse.json() as ManagedAttachment[] : [];
      return { activity: { slug: row.slug, date: row.date_label, title: row.title, audience: row.audience, location: row.location, participants: row.participants_label, detail: row.detail, image: row.cover_url || fallback?.image || "/media/evidence-1.jpg", attachments: attachments.map((item) => ({ label: item.label, kind: item.kind, href: item.file_url })) }, gallery: attachments.filter(isImageAttachment) };
    }
  }
  if (fallback) return { activity: fallback, gallery: fallback.attachments.filter((item) => item.kind === "ภาพกิจกรรม").map((item, index) => ({ id: `fallback-${index}`, label: item.label, kind: item.kind, file_url: item.href })) };
  notFound();
}

export default async function ActivityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { activity, gallery } = await loadActivity(slug);  const documentAttachments = activity.attachments.filter((file) => file.href && !isImageAttachment({ kind: file.kind, file_url: file.href }));
  const galleryWithLabels = gallery.map((image) => ({ ...image, displayLabel: cleanAttachmentLabel(image.label) }));
  return <main className="activity-page">
    <nav className="activity-nav"><Link href="/" className="activity-brand"><span className="nhrc-mark">กสม.</span><span><b>ค่าไฟแฟร์</b><small>ค่าไฟแฟร์ คือค่าไฟที่แคร์ประชาชน</small></span></Link><a href="/#journey">← กลับไปการดำเนินงาน</a></nav>
    <article className="activity-detail shell"><div className="activity-kicker">กิจกรรมรับฟังความคิดเห็น</div><h1>{activity.title}</h1><div className="activity-facts"><span>{activity.audience}</span><span className="activity-date">{activity.date}</span><span>{activity.location}</span><span>{activity.participants}</span></div><div className="activity-layout"><div><img src={activity.image} alt={`ภาพประกอบ ${activity.title}`} className="activity-image" /><small className="image-note">ภาพปกกิจกรรม</small>{galleryWithLabels.length > 0 && <div className="activity-gallery"><h2>แกลเลอรีภาพกิจกรรม</h2><div>{galleryWithLabels.map((image) => <a href={image.file_url} target="_blank" rel="noreferrer" key={image.id}><img src={image.file_url} alt={image.displayLabel || `ภาพกิจกรรม ${activity.title}`} />{image.displayLabel && <span>{image.displayLabel}</span>}</a>)}</div></div>}</div><div className="activity-copy"><h2>รายละเอียดกิจกรรม</h2>{activity.detail.split(/\n\s*\n|\n/).map((paragraph, index) => paragraph.trim() && <p className="detail-paragraph" key={index}>{paragraph.trim()}</p>)}<p className="detail-paragraph">ข้อมูลจากกิจกรรมนี้ถูกรวบรวมร่วมกับการศึกษาเอกสารและการรับฟังความคิดเห็นจากหลายภาคส่วน เพื่อใช้ประกอบการจัดทำข้อเสนอแนะของ กสม.</p>{documentAttachments.length > 0 && <div className="attachment-list"><h2>เอกสารและสื่อประกอบ</h2>{documentAttachments.map((file) => { const label = cleanAttachmentLabel(file.label) || attachmentKindLabel(file.kind); return <a className="attachment-link" href={file.href} target="_blank" rel="noreferrer" key={`${file.label}-${file.href}`}><span>{attachmentKindLabel(file.kind)}</span><b>{label}</b><strong>↗</strong></a> })}</div>}</div></div></article>
  </main>;
}

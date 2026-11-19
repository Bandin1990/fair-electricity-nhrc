"use client";

import { useEffect, useState } from "react";
import type { Activity } from "../../lib/content";
import "../activities/[slug]/detail.css";

type ManagedActivity = { id: string; slug: string; date_label: string; title: string; audience: string; location: string; participants_label: string; detail: string; cover_url: string | null };
type Attachment = { id: string; label: string; kind: string; file_url: string; storage_path?: string | null };

function isImage(item: { kind: string; file_url: string; storage_path?: string | null }) {
  return item.kind.toLowerCase() === "image" || item.kind === "ภาพกิจกรรม" || /\.(jpe?g|png|gif|webp|avif)(?:\?|$)/i.test(`${item.file_url} ${item.storage_path ?? ""}`);
}

function labelFor(item: { label: string; kind: string }) {
  const label = item.label.trim();
  if (label && !["ไฟล์แนบ", "ภาพกิจกรรม", "image"].includes(label.toLowerCase())) return label;
  if (item.kind === "summary") return "บันทึกประชุม";
  if (item.kind === "supporting") return "เอกสารนำเสนอวิทยากร";
  if (item.kind === "reference") return "เอกสารอ้างอิง";
  return "สื่อประกอบ";
}

export default function ActivityPage() {
  const [remote, setRemote] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const currentSlug = new URLSearchParams(window.location.search).get("slug") || "";
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key || !currentSlug) { setLoadError(true); setLoading(false); return; }
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    let active = true;
    (async () => {
      try {
        const response = await fetch(`${url}/rest/v1/activities?slug=eq.${encodeURIComponent(currentSlug)}&status=eq.published&select=id,slug,date_label,title,audience,location,participants_label,detail,cover_url`, { headers });
        if (!response.ok) throw new Error("Activity data unavailable");
        const row = (await response.json() as ManagedActivity[])[0];
        if (!row) return;
        const attachmentsResponse = await fetch(`${url}/rest/v1/activity_attachments?activity_id=eq.${row.id}&select=id,label,kind,file_url,storage_path&order=sort_order.asc`, { headers });
        if (!attachmentsResponse.ok) throw new Error("Activity attachments unavailable");
        const attachments = await attachmentsResponse.json() as Attachment[];
        if (active) setRemote({ slug: row.slug, date: row.date_label, title: row.title, audience: row.audience, location: row.location, participants: row.participants_label, detail: row.detail || "", image: row.cover_url || "", attachments: attachments.map((item) => ({ label: item.label, kind: isImage(item) ? "ภาพกิจกรรม" : item.kind, href: item.file_url })) });
      } catch { if (active) setLoadError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const activity = remote;
  const gallery = activity?.attachments.filter((item) => isImage({ kind: item.kind, file_url: item.href })) || [];
  const documents = activity?.attachments.filter((item) => item.href && !isImage({ kind: item.kind, file_url: item.href })) || [];

  return <main className="activity-page">
    <nav className="activity-nav"><a href="/" className="activity-brand"><span className="nhrc-mark">กสม.</span><span><b>ค่าไฟแฟร์</b><small>ค่าไฟแฟร์ คือค่าไฟที่แคร์ประชาชน</small></span></a><a href="/#journey">← กลับไปการดำเนินงาน</a></nav>
    {activity ? <article className="activity-detail shell"><div className="activity-kicker">กิจกรรมรับฟังความคิดเห็น</div><h1>{activity.title}</h1><div className="activity-facts"><span>{activity.audience}</span><span className="activity-date">{activity.date}</span><span>{activity.location}</span><span>{activity.participants}</span></div><div className={`activity-layout ${activity.image || gallery.length ? "" : "no-image"}`}>{(activity.image || gallery.length > 0) && <div>{activity.image && <><img src={activity.image} alt={`ภาพประกอบ ${activity.title}`} className="activity-image" /><small className="image-note">ภาพปกกิจกรรม</small></>}{gallery.length > 0 && <div className="activity-gallery"><h2>แกลเลอรีภาพกิจกรรม</h2><div>{gallery.map((image) => <a href={image.href} target="_blank" rel="noreferrer" key={image.href}><img src={image.href} alt={`ภาพกิจกรรม ${activity.title}`} /><span>{labelFor(image)}</span></a>)}</div></div>}</div>}<div className="activity-copy"><h2>รายละเอียดกิจกรรม</h2>{activity.detail.split(/\n\s*\n|\n/).map((paragraph, index) => paragraph.trim() && <p className="detail-paragraph" key={index}>{paragraph.trim()}</p>)}{documents.length > 0 && <div className="attachment-list"><h2>เอกสารและสื่อประกอบ</h2>{documents.map((file) => <a className="attachment-link" href={file.href} target="_blank" rel="noreferrer" key={`${file.label}-${file.href}`}><span>{labelFor(file)}</span><b>{file.label}</b><strong>↗</strong></a>)}</div>}</div></div></article> : <article className="activity-detail shell"><h1>{loading ? "กำลังโหลดรายละเอียดกิจกรรม…" : loadError ? "ไม่สามารถโหลดข้อมูลกิจกรรมจากฐานข้อมูลได้ในขณะนี้" : "ไม่พบรายละเอียดกิจกรรม"}</h1><p><a href="/#journey">กลับไปดูรายการกิจกรรม</a></p></article>}
  </main>;
}

"use client";
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useMemo, useState } from "react";
import { fallbackBackground, fallbackCommittee, fallbackProposalPoints, fallbackSurvey, type CommitteeMember, type ProjectBackground, type ProjectSurvey, type ProposalPoint } from "../lib/project";
import { fallbackMeasures, type ProposalMeasure } from "../lib/measures";

type ManagedActivity = { slug: string; date_label: string; title: string; audience: string; location: string; participants_label: string };
type ManagedMedia = { type: string; title: string; tag: string; href: string; image: string | null; tone: string; channel?: string; viewCount?: string; publishedLabel?: string; statLabel?: string };
type ManagedRight = { title: string; summary: string; detail?: string | null; cover_url?: string | null };
type ProposalDocument = { id?: string; title: string; summary: string; file_url: string; status?: string; sort_order?: number };
const defaultProposalDocuments: ProposalDocument[] = [
  { title: "ข้อเสนอแนะค่าไฟ — ฉบับสมบูรณ์", summary: "ข้อเสนอแนะ กสม. เลขที่ 229/2569 ลงวันที่ 1 กันยายน 2569 · PDF 79 หน้า", file_url: "https://uervlfkcqzasodbpfyos.supabase.co/storage/v1/object/public/site-media/proposal-229-2569-20261120.pdf", sort_order: 1, status: "published" },
  { title: "เอกสารนำเสนอข้อเสนอแนะ", summary: "สรุปสาระสำคัญสำหรับการนำเสนอ", file_url: "/docs/เอกสารนำเสนอ-ข้อเสนอแนะค่าไฟ.pdf", sort_order: 2, status: "published" },
];
function mediaThumbnail(url: string, kind: "video" | "document") {
  if (/\.(png|jpe?g|gif|webp|avif|svg)(?:\?|$)/i.test(url)) return url;
  const youtubeId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([^?&/]+)/)?.[1];
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  const localPdfCovers: Array<[string, string]> = [
    ["ข้อเสนอแนะค่าไฟ-ฉบับเต็ม.pdf", "/media/pdf-cover-ข้อเสนอแนะค่าไฟ-ฉบับเต็ม.png"],
    ["รายงานข้อเสนอแนะ-ฉบับกรกฎาคม.pdf", "/media/pdf-cover-รายงานข้อเสนอแนะ-ฉบับกรกฎาคม.png"],
    ["เอกสารนำเสนอ-กทม-กลาง-ตะวันออก-ตะวันตก.pdf", "/media/pdf-cover-เอกสารนำเสนอ-กทม-กลาง-ตะวันออก-ตะวันตก.png"],
    ["เอกสารนำเสนอ-ข้อเสนอแนะค่าไฟ.pdf", "/media/pdf-cover-เอกสารนำเสนอ-ข้อเสนอแนะค่าไฟ.png"],
    ["เอกสารนำเสนอ-ภาคใต้.pdf", "/media/pdf-cover-เอกสารนำเสนอ-ภาคใต้.png"],
    ["เอกสารนำเสนอ-ภาคเหนือ.pdf", "/media/pdf-cover-เอกสารนำเสนอ-ภาคเหนือ.png"],
  ];
  const localCover = localPdfCovers.find(([filename]) => url.includes(filename));
  if (localCover) return localCover[1];
  return kind === "document" ? "/media/report-cover.jpg" : "/media/evidence-9.jpg";
}
function mediaEmbedUrl(url: string) {
  const youtubeId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([^?&/]+)/)?.[1];
  if (youtubeId) return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
  if (/facebook\.com\//i.test(url)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
  return null;
}

const media = [
  { type: "วิดีโอ", title: "ค่าไฟไทย ความเหลื่อมล้ำกับคำถามว่าทำไมยิ่งจนยิ่งจ่ายแพงกว่า?", tag: "KEY MESSAGES #262", href: "https://youtu.be/tgqFaZpFk94", image: "/media/evidence-4.jpg", tone: "orange" },
  { type: "คลิปสั้น", title: "สิทธิผู้ใช้ไฟในแผน PDP สู่ไฟฟ้าราคาที่เป็นธรรม", tag: "FB กสม.", href: "https://www.facebook.com/reel/5439998426225570", image: "/media/evidence-6.jpg", tone: "blue" },
  { type: "คลิปสั้น", title: "โซลาร์เซลล์เปลี่ยนค่าไฟให้เป็นธรรมทันทีได้อย่างไร", tag: "Quick Win", href: "https://www.facebook.com/reel/4292381747683320", image: "/media/evidence-7.jpg", tone: "green" },
  { type: "อินโฟกราฟิก", title: "หน่วยไฟฟรีผ่านบัตรสวัสดิการแห่งรัฐ เข้าถึงไม่ง่าย", tag: "ประเด็นที่ต้องมองเห็น", href: "https://www.facebook.com/share/p/187Chps2q2/", image: "/media/evidence-1.jpg", tone: "violet" },
  { type: "อินโฟกราฟิก", title: "ค่าไฟเฉลี่ยต่อเดือนของครัวเรือนแตกต่างตามภูมิภาค", tag: "ข้อมูลเพื่อความเข้าใจ", href: "https://www.facebook.com/share/p/19ps8ytdtg/", image: "/media/evidence-2.jpg", tone: "yellow" },
  { type: "วิดีโอ", title: "ไฟฟ้าไม่ใช่แค่ต้นทุนพลังงาน แต่คือสิทธิมนุษยชน", tag: "DataHatch", href: "https://youtu.be/tgqFaZpFk94", image: "/media/evidence-9.jpg", tone: "ink" },
  { type: "เอกสารนำเสนอ", title: "สรุปข้อเสนอแนะค่าไฟฟ้าของ กสม.", tag: "เอกสารนำเสนอ", href: "/docs/เอกสารนำเสนอ-ข้อเสนอแนะค่าไฟ.pdf", image: null, tone: "orange" },
  { type: "รายงาน", title: "รายงานข้อเสนอแนะค่าไฟที่เป็นธรรม", tag: "รายงานโครงการ", href: "/docs/รายงานข้อเสนอแนะ-ฉบับกรกฎาคม.pdf", image: "/media/report-cover.jpg", tone: "ink" },
  { type: "รายงาน", title: "รายงานผลการดำเนินการและรายงานค่าใช้จ่าย", tag: "รายงานผลการดำเนินงาน", href: "/docs/รายงานผลการดำเนินการและรายงานค่าใช้จ่าย.docx", image: "/media/report-cover.jpg", tone: "blue" },
  { type: "เอกสารนำเสนอ", title: "เวที กทม. ภาคกลาง ตะวันออก และตะวันตก", tag: "เอกสารนำเสนอรายภูมิภาค", href: "/docs/เอกสารนำเสนอ-กทม-กลาง-ตะวันออก-ตะวันตก.pdf", image: "/media/evidence-8.jpg", tone: "blue" },
  { type: "เอกสารนำเสนอ", title: "เวทีรับฟังความคิดเห็นภาคเหนือ", tag: "เอกสารนำเสนอรายภูมิภาค", href: "/docs/เอกสารนำเสนอ-ภาคเหนือ.pdf", image: "/media/evidence-10.jpg", tone: "green" },
  { type: "เอกสารนำเสนอ", title: "เวทีรับฟังความคิดเห็นภาคใต้", tag: "เอกสารนำเสนอรายภูมิภาค", href: "/docs/เอกสารนำเสนอ-ภาคใต้.pdf", image: "/media/evidence-11.jpg", tone: "violet" },
];
const rights = [
  ["⌂", "สิทธิในมาตรฐานการดำรงชีวิตที่เพียงพอ", "ทุกคนควรเข้าถึงไฟฟ้าที่จำเป็นต่อการดำรงชีวิตได้ ในราคาที่ไม่กระทบสิทธิขั้นพื้นฐานอื่น เช่น อาหาร สุขภาพ และการศึกษา"],
  ["☝", "สิทธิในการมีส่วนร่วมของประชาชน", "ประชาชนมีสิทธิได้รับข้อมูลที่เข้าใจง่าย แสดงความคิดเห็น และมีส่วนร่วมอย่างมีความหมายต่อการกำหนดนโยบายพลังงาน"],
  ["♧", "สิทธิในการเข้าถึงและใช้ประโยชน์จากทรัพยากรธรรมชาติ", "การจัดการทรัพยากรพลังงานต้องคำนึงถึงประโยชน์ของประชาชนและชุมชน พร้อมรักษาความสมดุลและความยั่งยืน"],
  ["↗", "สิทธิในการมีส่วนร่วมในการพัฒนาและได้รับประโยชน์อย่างเป็นธรรม", "การพัฒนาระบบไฟฟ้าต้องไม่กระจุกตัวอยู่กับคนบางกลุ่ม และต้องกระจายประโยชน์กลับสู่ประชาชนอย่างเป็นธรรม"],
  ["✿", "สิทธิในสิ่งแวดล้อมที่ดี", "ประชาชนควรได้รับการคุ้มครองจากมลพิษและผลกระทบทางสิ่งแวดล้อมที่เกิดจากการผลิตและจัดส่งพลังงาน"],
  ["⚡", "สิทธิในการเข้าถึงสาธารณูปโภคขั้นพื้นฐานที่มีคุณภาพ", "รัฐมีหน้าที่จัดให้มีไฟฟ้าที่ทั่วถึง มั่นคง มีคุณภาพ และมีอัตราค่าบริการที่เป็นธรรม โดยไม่ทิ้งใครไว้ข้างหลัง"],
];

export default function Home() {
  const [filter, setFilter] = useState("ทั้งหมด");
  const [typedHero, setTypedHero] = useState("");
  const [background, setBackground] = useState<ProjectBackground>(fallbackBackground);
  const [committee, setCommittee] = useState<CommitteeMember[]>(fallbackCommittee);
  const [survey, setSurvey] = useState<ProjectSurvey>(fallbackSurvey);
  const [managedActivities, setManagedActivities] = useState<ManagedActivity[]>([]);
  const [activityLoadState, setActivityLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [managedMedia, setManagedMedia] = useState<ManagedMedia[]>([]);
  const [managedDocuments, setManagedDocuments] = useState<ManagedMedia[]>([]);
  const [managedRights, setManagedRights] = useState<ManagedRight[]>([]);
  const [proposalDocuments, setProposalDocuments] = useState<ProposalDocument[]>(defaultProposalDocuments);
  const [proposalPoints, setProposalPoints] = useState<ProposalPoint[]>(fallbackProposalPoints);
  const [measures, setMeasures] = useState<ProposalMeasure[]>(fallbackMeasures);
  const [selectedProposalPoint, setSelectedProposalPoint] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<ManagedMedia | null>(null);
  const displayActivities = managedActivities;
  const displayMedia = [...(managedMedia.length ? managedMedia : media.filter((item) => !item.type.includes("เอกสาร") && item.type !== "รายงาน")), ...(managedDocuments.length ? managedDocuments : media.filter((item) => item.type.includes("เอกสาร") || item.type === "รายงาน"))];
  const displayRights = rights.map(([icon, fallbackTitle, fallbackSummary], index) => { const item = managedRights[index]; return [icon, item?.title || fallbackTitle, item?.summary || fallbackSummary, item?.cover_url || "", item?.detail || item?.summary || fallbackSummary] as [string, string, string, string, string]; });
  const filteredMedia = useMemo(() => filter === "ทั้งหมด" ? displayMedia : displayMedia.filter((item) => item.type === filter), [filter, displayMedia]);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) { setActivityLoadState("error"); return; }
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    fetch(`${url}/rest/v1/project_background?id=eq.main&select=title,facts,closing,source_url,image_url`, { headers }).then((r) => r.ok ? r.json() : []).then((rows) => rows[0] && setBackground({ ...fallbackBackground, ...rows[0], source_url: rows[0].source_url?.trim() || fallbackBackground.source_url })).catch(() => {});
    fetch(`${url}/rest/v1/committee_members?select=id,name,role,note,image_url&status=eq.published&order=sort_order.asc`, { headers }).then((r) => r.ok ? r.json() : []).then((rows: CommitteeMember[]) => {
      if (!rows.length) return;
      setCommittee(fallbackCommittee.map((member) => {
        const portrait = rows.find((row) => member.name.endsWith(row.name.trim()));
        return { ...member, image_url: portrait?.image_url || member.image_url };
      }));
    }).catch(() => {});
    fetch(`${url}/rest/v1/project_survey?id=eq.main&select=title,intro,highlights,source_url`, { headers }).then((r) => r.ok ? r.json() : []).then((rows) => {
      const remote = rows[0] as Partial<ProjectSurvey> | undefined;
      if (!remote) return;
      setSurvey({
        ...fallbackSurvey,
        ...remote,
        title: remote.title?.trim() || fallbackSurvey.title,
        intro: remote.intro?.trim() || fallbackSurvey.intro,
        highlights: Array.isArray(remote.highlights) && remote.highlights.length ? remote.highlights : fallbackSurvey.highlights,
        source_url: fallbackSurvey.source_url,
      });
    }).catch(() => {});
    fetch(`${url}/rest/v1/activities?status=eq.published&select=slug,date_label,title,audience,location,participants_label,sort_order&order=sort_order.asc,created_at.desc`, { headers }).then((r) => { if (!r.ok) throw new Error("Activity data unavailable"); return r.json(); }).then((rows) => { setManagedActivities(rows); setActivityLoadState("ready"); }).catch(() => setActivityLoadState("error"));
    fetch(`${url}/rest/v1/content_items?kind=eq.media&status=eq.published&select=title,summary,source_url,cover_url,media_type,channel,view_count,published_label,stat_label&order=created_at.desc`, { headers }).then((r) => r.ok ? r.json() : []).then((rows) => rows.length && setManagedMedia(rows.map((row: { title: string; summary: string; source_url: string; cover_url: string | null; media_type?: string; channel?: string; view_count?: string; published_label?: string; stat_label?: string }) => ({ type: row.media_type === "คลิปวิชาการ" ? "วิดีโอ" : row.media_type || "วิดีโอ", title: row.title, tag: row.summary || row.channel || "คลังสื่อ", href: row.source_url, image: row.cover_url || mediaThumbnail(row.source_url, "video"), tone: "blue", channel: row.channel, viewCount: row.view_count, publishedLabel: row.published_label, statLabel: row.stat_label })))).catch(() => {});
    fetch(`${url}/rest/v1/content_items?kind=eq.document&status=eq.published&select=title,summary,source_url,cover_url&order=created_at.desc`, { headers }).then((r) => r.ok ? r.json() : []).then((rows) => rows.length && setManagedDocuments(rows.map((row: { title: string; summary: string; source_url: string; cover_url: string | null }) => ({ type: row.title.includes("รายงาน") ? "รายงาน" : "เอกสารนำเสนอ", title: row.title, tag: row.summary || "เอกสารเผยแพร่", href: row.source_url, image: row.cover_url || mediaThumbnail(row.source_url, "document"), tone: "ink" })))).catch(() => {});
    fetch(`${url}/rest/v1/content_items?kind=eq.proposal&status=eq.published&select=title,summary,detail,cover_url&order=created_at.asc`, { headers }).then((r) => r.ok ? r.json() : []).then((rows) => rows.length && setManagedRights(rows)).catch(() => {});
    fetch(`${url}/rest/v1/proposal_points?status=eq.published&select=id,title,summary,sort_order,status&order=sort_order.asc`, { headers }).then((r) => r.ok ? r.json() : []).then((rows) => rows.length && setProposalPoints(rows)).catch(() => {});
    fetch(`${url}/rest/v1/proposal_measures?status=eq.published&select=id,point_order,category_title,item_no,title,agencies,timeframe,detail,sort_order,status&order=sort_order.asc`, { headers }).then((r) => r.ok ? r.json() : []).then((rows) => rows.length && setMeasures(rows)).catch(() => {});
    fetch(`${url}/rest/v1/proposal_documents?status=eq.published&select=id,title,summary,file_url,sort_order,status&order=sort_order.asc`, { headers }).then((r) => r.ok ? r.json() : []).then((rows: ProposalDocument[]) => {
      if (!rows.length) return;
      const fullReport = defaultProposalDocuments[0];
      const published = rows
        .filter((document) => document.title !== "รายงานที่เกี่ยวข้อง" && document.file_url !== "/docs/รายงานข้อเสนอแนะ-ฉบับกรกฎาคม.pdf")
        .map((document) => document.title === fullReport.title ? { ...document, file_url: fullReport.file_url, summary: fullReport.summary } : document);
      const missingDefaults = defaultProposalDocuments.filter((document) => !published.some((item) => item.title === document.title));
      setProposalDocuments([...published, ...missingDefaults].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    }).catch(() => {});
  }, []);
  useEffect(() => {
    const phrase = "ค่าไฟที่เป็นธรรม|คือสิทธิของทุกคน";
    if (typedHero.length >= phrase.length) return;
    const timer = window.setTimeout(() => setTypedHero(phrase.slice(0, typedHero.length + 1)), typedHero.length < 17 ? 82 : 70);
    return () => window.clearTimeout(timer);
  }, [typedHero]);
  return <main>
    <div className="topbar"><span>สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ</span><span>โครงการจัดทำข้อเสนอแนะค่าไฟฟ้าที่เหมาะสมและเป็นธรรมต่อภาคครัวเรือน</span></div>
    <nav className="nav"><a className="brand" href="#top" aria-label="หน้าหลัก"><span className="nhrc-mark">กสม.</span><span><b>ค่าไฟแฟร์</b><small>ค่าไฟแฟร์ คือค่าไฟที่แคร์ประชาชน</small></span></a><div className="navlinks"><a href="#story">ที่มา</a><a href="#journey">การดำเนินงาน</a><a href="#proposals">ข้อเสนอแนะ</a><a href="#media">คลังสื่อ</a><a href="#proposals">เอกสาร</a></div><a className="nav-cta" href="https://www.nhrc.or.th/th" target="_blank" rel="noreferrer">เว็บไซต์ กสม. ↗</a></nav>
    <section className="hero" id="top"><div className="hero-grid shell"><div className="hero-copy"><p className="eyebrow">PUBLIC INTEREST / ELECTRICITY JUSTICE</p><h1>{typedHero.split("|")[0]}<br /><em>{typedHero.split("|")[1] ?? ""}</em><span className="typing-cursor" aria-hidden="true">▋</span></h1><p className="hero-lead">พื้นที่รวบรวมผลการดำเนินงาน เสียงสะท้อนจากประชาชน และข้อเสนอเชิงนโยบายของ กสม. เพื่อขยับระบบไฟฟ้าไทยให้เป็นธรรม โปร่งใส และไม่ทิ้งใครไว้ข้างหลัง</p><div className="hero-actions"><a className="button button-dark" href="#proposals">ดูข้อเสนอแนะ <span>↓</span></a><a className="text-link" href="#media">สำรวจคลังสื่อ ↗</a></div></div><div className="hero-art"><img className="hero-image" src="/media/hero-fair-electricity.png" alt="ค่าไฟที่เป็นธรรม สำหรับครัวเรือน" /><div className="hero-rule"></div></div></div></section>
    <section className="section shell story" id="story"><div className="section-label">01 / ความเป็นมาของโครงการ</div><div className="story-grid"><div><h2>ความเป็นมา<br /><span>ของโครงการ</span></h2></div><div className="story-text">{background.image_url && <img className="background-image" src={background.image_url} alt="ภาพประกอบความเป็นมาของโครงการ" />}<p className="bigquote">“ค่าไฟฟ้าไม่ใช่แค่ตัวเลขในบิล แต่เกี่ยวข้องกับสิทธิในการดำรงชีวิตอย่างมีศักดิ์ศรี”</p>{background.facts.map((fact) => <p key={fact}>{fact}</p>)}<p>{background.closing}</p><a className="arrow-link" href="/about">อ่านที่มาและวัตถุประสงค์โครงการ <span>↗</span></a><div className="committee-list"><h3>คณะอนุกรรมการ</h3><p className="committee-intro">คณะอนุกรรมการจัดทำข้อเสนอแนะเกี่ยวกับการกำหนดอัตราราคาค่าไฟฟ้าที่เหมาะสมและเป็นธรรมต่อภาคครัวเรือน จัดตั้งขึ้นเพื่อศึกษาและวิเคราะห์ข้อมูล เปิดพื้นที่รับฟังความคิดเห็นจากทุกภาคส่วน และจัดทำข้อเสนอแนะเชิงนโยบายบนฐานสิทธิมนุษยชน</p>{committee.map((member) => <div className="committee-member" key={member.id ?? member.name}>{member.image_url ? <img src={member.image_url} alt={`ภาพ ${member.name}`} /> : <span className="committee-placeholder">กสม.</span>}<span className="committee-copy"><b>{member.name}</b><span>{member.role}</span>{member.note && <small>{member.note}</small>}</span></div>)}</div><section className="survey-section"><div className="survey-grid"><div className="survey-lead"><h2>{survey.title}<br /><span>เสียงจากประชาชนต้องอยู่ในสมการค่าไฟ</span></h2><p>{survey.intro}</p><a className="button button-dark survey-button" href={survey.source_url} target="_blank" rel="noreferrer">เปิดอ่านรายงานฉบับเต็ม ↗</a></div><div className="survey-stats"><div><strong>5,130</strong><span>กลุ่มตัวอย่าง</span></div><div><strong>77</strong><span>จังหวัดที่ครอบคลุม</span></div><div><strong>4,050</strong><span>สำรวจภาคสนาม</span></div><div><strong>1,080</strong><span>สำรวจออนไลน์</span></div></div><div className="survey-highlights"><h3>ข้อค้นพบจากการสำรวจ</h3>{survey.highlights.map((highlight, index) => <div className="survey-highlight" key={`${index}-${highlight}`}><b>{String(index + 1).padStart(2, "0")}</b><p>{highlight}</p></div>)}</div></div></section></div></div></section>
    <section className="section dark-section" id="journey"><div className="shell"><div className="section-label light">02 / จากเสียงสู่ข้อเสนอ</div><div className="section-head"><h2>การดำเนินงาน</h2><p>ตลอดโครงการ กสม. เปิดพื้นที่พูดคุยกับรัฐ ผู้ผลิตพลังงาน นักวิชาการ ผู้ได้รับผลกระทบ และประชาชนในทุกภูมิภาค</p></div><div className="timeline">{activityLoadState !== "ready" && <p className="timeline-status">{activityLoadState === "loading" ? "กำลังโหลดกิจกรรม…" : "ไม่สามารถโหลดข้อมูลกิจกรรมจากฐานข้อมูลได้ในขณะนี้"}</p>}{displayActivities.map((event, index) => <a className="timeline-row" href={`/activity?slug=${encodeURIComponent(event.slug)}`} key={event.slug}><div className="timeline-date"><b>{"date_label" in event ? event.date_label : event.date}</b><span>{event.location}</span></div><div className="timeline-dot">{String(index + 1).padStart(2, "0")}</div><div className="timeline-main"><h3>{event.title}</h3><p>{event.audience} <span className="timeline-participants">· {"participants_label" in event ? event.participants_label : event.participants}</span></p><small>อ่านรายละเอียดกิจกรรม ↗</small></div></a>)}</div></div></section>
    <section className="section media-section" id="media"><div className="shell"><div className="section-label">04 / ฟังต่อ ดูต่อ</div><div className="media-head"><div><h2>คลังสื่อ<br /><span>ที่ชวนคิดเรื่องค่าไฟ</span></h2></div><div className="filters">{["ทั้งหมด", "วิดีโอ", "คลิปสั้น", "อินโฟกราฟิก", "อัลบั้มภาพ", "คลิป Live", "เอกสารนำเสนอ", "รายงาน"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div><div className="media-grid">{filteredMedia.map((item) => <button className={`media-card ${item.tone}`} type="button" onClick={() => setSelectedMedia(item)} key={item.title}><div className="media-visual"><img src={item.image || mediaThumbnail(item.href, item.type.includes("เอกสาร") || item.type === "รายงาน" ? "document" : "video")} alt={`ภาพตัวอย่าง: ${item.title}`} /><span className="play">{item.type.includes("กราฟิก") ? "▦" : item.type.includes("เอกสาร") || item.type === "รายงาน" ? "▤" : "▶"}</span><span className="media-type">{item.type}</span></div><div className="media-card-copy"><span>{item.tag}</span><h3>{item.title}</h3><b>{item.type === "รายงาน" || item.type.includes("เอกสาร") ? "อ่านรายละเอียด ↗" : "ดูสื่อในเว็บไซต์ ↗"}</b></div></button>)}</div></div></section>
    <section className="section shell proposal-section" id="proposals"><div className="proposal-intro"><h2>ไฟฟ้าที่ดี<br /><span>ต้องเป็นธรรมด้วย</span></h2><p>ข้อเสนอแนะของ กสม. จัดทำขึ้นบนกรอบสิทธิมนุษยชนที่สำคัญ 6 ประการ</p></div><div className="rights-grid">{displayRights.map(([icon, title, summary, coverUrl], index) => <button className="right-card" type="button" onClick={() => setSelectedRight(index)} key={title}><span className="right-icon"><img src={coverUrl || `/media/rights-${index + 1}.png`} alt="" /></span><h3>{title}</h3><p>{summary}</p><span className="right-more">อ่านรายละเอียด +</span></button>)}</div><div className="proposal-summary"><h3>สาระสำคัญของข้อเสนอแนะของ กสม.</h3><div className="proposal-summary-grid">{proposalPoints.map((item, index) => <button className="proposal-summary-card" type="button" key={item.id ?? item.title} onClick={() => setSelectedProposalPoint(index)}><h4>{item.title}</h4><p>{item.summary}</p><span>ดูมาตรการที่เกี่ยวข้อง ↗</span></button>)}</div></div><div className="proposal-docs"><h3>ข้อเสนอแนะฉบับสมบูรณ์</h3><p>เอกสารเผยแพร่ที่ผ่านการตรวจทานแล้ว สำหรับอ่านและอ้างอิง โดยไม่เผยแพร่เอกสารร่างหรือเอกสาร Index</p><div className="doc-list">{proposalDocuments.map((document) => <a href={document.file_url} target="_blank" rel="noreferrer" key={document.id ?? document.title}><span className="file-icon">PDF</span><span><b>{document.title}</b><small>{document.summary}</small></span><strong>↓</strong></a>)}</div></div></section>
    {selectedProposalPoint !== null && <div className="right-modal-backdrop" role="presentation" onClick={() => setSelectedProposalPoint(null)}><div className="measure-modal" role="dialog" aria-modal="true" aria-labelledby="measure-modal-title" onClick={(event) => event.stopPropagation()}><button className="right-modal-close" type="button" aria-label="ปิดรายละเอียด" onClick={() => setSelectedProposalPoint(null)}>×</button><span className="measure-modal-kicker">มาตรการเชิงข้อเสนอแนะ</span><h2 id="measure-modal-title">{proposalPoints[selectedProposalPoint].title}</h2><p className="measure-modal-intro">{proposalPoints[selectedProposalPoint].summary}</p><a className="measure-source-link" href={`${defaultProposalDocuments[0].file_url}#page=29`} target="_blank" rel="noreferrer">อ่านข้อเสนอแนะ กสม. เลขที่ 229/2569 ฉบับเต็ม ↗</a><div className="measure-list">{measures.filter((item) => item.point_order === selectedProposalPoint + 1).map((item) => <article className="measure-item" key={item.id ?? `${item.point_order}-${item.item_no}-${item.title}`}><div className="measure-item-head"><b>มาตรการที่ {item.item_no}</b></div><h3>{item.title}</h3><p>{item.detail}</p><div className="measure-agency"><strong>เสนอถึง</strong><span>{item.agencies}</span></div></article>)}</div></div></div>}
    {selectedRight !== null && <div className="right-modal-backdrop" role="presentation" onClick={() => setSelectedRight(null)}><div className="right-modal" role="dialog" aria-modal="true" aria-labelledby="right-modal-title" onClick={(event) => event.stopPropagation()}><button className="right-modal-close" type="button" aria-label="ปิดรายละเอียด" onClick={() => setSelectedRight(null)}>×</button><span className="right-modal-icon"><img src={displayRights[selectedRight][3] || `/media/rights-${selectedRight + 1}.png`} alt="" /></span><h2 id="right-modal-title">{displayRights[selectedRight][1]}</h2><p>{displayRights[selectedRight][4]}</p></div></div>}
    {selectedMedia && <div className="media-preview-backdrop" role="presentation" onClick={() => setSelectedMedia(null)}><div className="media-preview-modal" role="dialog" aria-modal="true" aria-labelledby="media-preview-title" onClick={(event) => event.stopPropagation()}><button className="right-modal-close" type="button" aria-label="ปิดสื่อ" onClick={() => setSelectedMedia(null)}>×</button><div className="media-preview-stage">{mediaEmbedUrl(selectedMedia.href) ? <iframe src={mediaEmbedUrl(selectedMedia.href) ?? undefined} title={selectedMedia.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : /\.(mp4|webm|ogg)(?:\?|$)/i.test(selectedMedia.href) ? <video src={selectedMedia.href} controls autoPlay /> : /\.(png|jpe?g|gif|webp|avif|svg)(?:\?|$)/i.test(selectedMedia.href) ? <img src={selectedMedia.href} alt={selectedMedia.title} /> : selectedMedia.type === "รายงาน" || selectedMedia.type.includes("เอกสาร") ? <iframe src={selectedMedia.href} title={selectedMedia.title} /> : <img src={selectedMedia.image || mediaThumbnail(selectedMedia.href, "video")} alt={selectedMedia.title} />}</div><div className="media-preview-copy"><span>{selectedMedia.tag}</span><h2 id="media-preview-title">{selectedMedia.title}</h2><p>{[selectedMedia.channel, selectedMedia.publishedLabel && `เผยแพร่ ${selectedMedia.publishedLabel}`, selectedMedia.statLabel && `ตรวจสอบ ${selectedMedia.statLabel}`].filter(Boolean).join(" · ") || "เปิดอ่านหรือรับชมเนื้อหาภายในเว็บไซต์ได้จากหน้านี้"}</p><a className="media-fallback-link" href={selectedMedia.href} target="_blank" rel="noreferrer">เปิดต้นฉบับในแท็บใหม่ ↗</a></div></div></div>}
    <footer><div className="shell footer-grid"><div className="brand footer-brand"><span className="nhrc-mark">กสม.</span><span><b>ค่าไฟแฟร์</b><small>ค่าไฟแฟร์ คือค่าไฟที่แคร์ประชาชน</small></span></div><div><p>โครงการจัดทำข้อเสนอแนะในการกำหนดอัตราราคาค่าไฟฟ้าที่เหมาะสมและเป็นธรรมต่อภาคครัวเรือน</p><a href="https://www.nhrc.or.th/th" target="_blank" rel="noreferrer">nhrc.or.th/th ↗</a></div><div className="footer-note">อัปเดตการนำเสนอ: มิถุนายน 2569</div></div></footer>
  </main>;
}

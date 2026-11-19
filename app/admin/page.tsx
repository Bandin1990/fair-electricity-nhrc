"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { fallbackBackground, fallbackCommittee, fallbackProposalPoints, fallbackSurvey, type CommitteeMember, type ProjectBackground, type ProjectSurvey, type ProposalPoint } from "../../lib/project";
import { activities as defaultActivities } from "../../lib/content";
import { fallbackMeasures, type ProposalMeasure } from "../../lib/measures";
import "./admin.css";
import "./status.css";

type ActivityAttachmentRow = { id?: string; activity_id?: string; label: string; kind: "summary" | "image" | "supporting" | "reference"; file_url: string; storage_path?: string; sort_order?: number };
type ActivityRow = { id?: string; slug: string; date_label: string; title: string; audience: string; location: string; participants_label: string; detail: string; cover_url: string; status: string; sort_order?: number; attachments?: ActivityAttachmentRow[]; pending_attachment_label?: string; pending_attachment_kind?: ActivityAttachmentRow["kind"]; pending_attachment_url?: string };
type ContentRow = { id?: string; kind: "media" | "document" | "proposal"; title: string; summary: string; detail?: string; cover_url: string; source_url: string; media_type?: string; channel?: string; view_count?: string; published_label?: string; stat_label?: string; status: string };
type ProposalDocumentRow = { id?: string; title: string; summary: string; file_url: string; sort_order: number; status: string };
type StoredSession = { access_token: string; refresh_token?: string; expires_at?: number };
const SESSION_KEY = "fair-electricity-admin-session";
const emptyActivity = (): ActivityRow => ({ slug: `กิจกรรมใหม่-${Date.now()}`, date_label: "", title: "", audience: "", location: "", participants_label: "", detail: "", cover_url: "", status: "draft", sort_order: 0 });
const generatedActivitySlug = () => `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const defaultProposalDocuments: ProposalDocumentRow[] = [{ title: "ข้อเสนอแนะค่าไฟ — ฉบับสมบูรณ์", summary: "เอกสาร PDF สำหรับอ่านและอ้างอิง", file_url: "/docs/ข้อเสนอแนะค่าไฟ-ฉบับเต็ม.pdf", sort_order: 1, status: "published" }, { title: "เอกสารนำเสนอข้อเสนอแนะ", summary: "สรุปสาระสำคัญสำหรับการนำเสนอ", file_url: "/docs/เอกสารนำเสนอ-ข้อเสนอแนะค่าไฟ.pdf", sort_order: 2, status: "published" }, { title: "รายงานที่เกี่ยวข้อง", summary: "รายงานผลการดำเนินงานโครงการ", file_url: "/docs/รายงานข้อเสนอแนะ-ฉบับกรกฎาคม.pdf", sort_order: 3, status: "published" }];
const emptyContent = (kind: ContentRow["kind"]): ContentRow => ({ kind, title: "", summary: "", detail: "", cover_url: "", source_url: "", media_type: kind === "media" ? "วิดีโอ" : "", channel: "", view_count: "", published_label: "", stat_label: "", status: "draft" });
const defaultMedia: ContentRow[] = [
  { kind: "media", title: "ค่าไฟไทย ความเหลื่อมล้ำกับคำถามว่าทำไมยิ่งจนยิ่งจ่ายแพงกว่า?", summary: "KEY MESSAGES #262", source_url: "https://youtu.be/tgqFaZpFk94", cover_url: "/media/evidence-4.jpg", status: "published" },
  { kind: "media", title: "สิทธิผู้ใช้ไฟในแผน PDP สู่ไฟฟ้าราคาที่เป็นธรรม", summary: "FB กสม.", source_url: "https://www.facebook.com/reel/5439998426225570", cover_url: "/media/evidence-6.jpg", status: "published" },
  { kind: "media", title: "โซลาร์เซลล์เปลี่ยนค่าไฟให้เป็นธรรมทันทีได้อย่างไร", summary: "Quick Win", source_url: "https://www.facebook.com/reel/4292381747683320", cover_url: "/media/evidence-7.jpg", status: "published" },
  { kind: "media", title: "หน่วยไฟฟรีผ่านบัตรสวัสดิการแห่งรัฐ เข้าถึงไม่ง่าย", summary: "ประเด็นที่ต้องมองเห็น", source_url: "https://www.facebook.com/share/p/187Chps2q2/", cover_url: "/media/evidence-1.jpg", status: "published" },
  { kind: "media", title: "ค่าไฟเฉลี่ยต่อเดือนของครัวเรือนแตกต่างตามภูมิภาค", summary: "ข้อมูลเพื่อความเข้าใจ", source_url: "https://www.facebook.com/share/p/19ps8ytdtg/", cover_url: "/media/evidence-2.jpg", status: "published" },
  { kind: "media", title: "ไฟฟ้าไม่ใช่แค่ต้นทุนพลังงาน แต่คือสิทธิมนุษยชน", summary: "DataHatch", source_url: "https://youtu.be/tgqFaZpFk94", cover_url: "/media/evidence-9.jpg", status: "published" },
  { kind: "document", title: "สรุปข้อเสนอแนะค่าไฟฟ้าของ กสม.", summary: "เอกสารนำเสนอ", source_url: "/docs/เอกสารนำเสนอ-ข้อเสนอแนะค่าไฟ.pdf", cover_url: "", status: "published" },
  { kind: "document", title: "รายงานข้อเสนอแนะค่าไฟที่เป็นธรรม", summary: "รายงานโครงการ", source_url: "/docs/รายงานข้อเสนอแนะ-ฉบับกรกฎาคม.pdf", cover_url: "/media/report-cover.jpg", status: "published" },
  { kind: "document", title: "รายงานผลการดำเนินการและรายงานค่าใช้จ่าย", summary: "รายงานผลการดำเนินงาน", source_url: "/docs/รายงานผลการดำเนินการและรายงานค่าใช้จ่าย.docx", cover_url: "/media/report-cover.jpg", status: "published" },
  { kind: "document", title: "เวที กทม. ภาคกลาง ตะวันออก และตะวันตก", summary: "เอกสารนำเสนอรายภูมิภาค", source_url: "/docs/เอกสารนำเสนอ-กทม-กลาง-ตะวันออก-ตะวันตก.pdf", cover_url: "/media/evidence-8.jpg", status: "published" },
  { kind: "document", title: "เวทีรับฟังความคิดเห็นภาคเหนือ", summary: "เอกสารนำเสนอรายภูมิภาค", source_url: "/docs/เอกสารนำเสนอ-ภาคเหนือ.pdf", cover_url: "/media/evidence-10.jpg", status: "published" },
  { kind: "document", title: "เวทีรับฟังความคิดเห็นภาคใต้", summary: "เอกสารนำเสนอรายภูมิภาค", source_url: "/docs/เอกสารนำเสนอ-ภาคใต้.pdf", cover_url: "/media/evidence-11.jpg", status: "published" },
];
const defaultRights: ContentRow[] = [
  ["สิทธิในมาตรฐานการดำรงชีวิตที่เพียงพอ", "ทุกคนควรเข้าถึงไฟฟ้าที่จำเป็นต่อการดำรงชีวิตได้ ในราคาที่ไม่กระทบสิทธิขั้นพื้นฐานอื่น"],
  ["สิทธิในการมีส่วนร่วมของประชาชน", "ประชาชนมีสิทธิได้รับข้อมูลที่เข้าใจง่าย แสดงความคิดเห็น และมีส่วนร่วมอย่างมีความหมาย"],
  ["สิทธิในการเข้าถึงและใช้ประโยชน์จากทรัพยากรธรรมชาติ", "การจัดการทรัพยากรพลังงานต้องคำนึงถึงประโยชน์ของประชาชนและชุมชน"],
  ["สิทธิในการมีส่วนร่วมในการพัฒนาและได้รับประโยชน์อย่างเป็นธรรม", "การพัฒนาระบบไฟฟ้าต้องกระจายประโยชน์กลับสู่ประชาชนอย่างเป็นธรรม"],
  ["สิทธิในสิ่งแวดล้อมที่ดี", "ประชาชนควรได้รับการคุ้มครองจากผลกระทบทางสิ่งแวดล้อมที่เกิดจากพลังงาน"],
  ["สิทธิในการเข้าถึงสาธารณูปโภคขั้นพื้นฐานที่มีคุณภาพ", "รัฐมีหน้าที่จัดให้มีไฟฟ้าที่ทั่วถึง มั่นคง มีคุณภาพ และมีอัตราค่าบริการที่เป็นธรรม"],
].map(([title, summary], index) => ({ kind: "proposal", title, summary, detail: summary, cover_url: `/media/rights-${index + 1}.png`, source_url: "", status: "published" }));
const withPageContentDefaults = (rows: ContentRow[]) => {
  // ใช้ข้อมูลจริงจากฐานข้อมูลเป็นหลัก เมื่อหมวดนั้นมีข้อมูลแล้ว
  // เพื่อไม่ให้รายการสำรองกลับมาแสดงหลังจากผู้ดูแลลบรายการจริง
  const kindsWithStoredRows = new Set(rows.map((row) => row.kind));
  const defaults = [...defaultMedia, ...defaultRights].filter((item) => !kindsWithStoredRows.has(item.kind));
  return [...rows, ...defaults];
};

export default function AdminPage() {
  const [active, setActive] = useState("ความเป็นมา");
  const [connection, setConnection] = useState("กำลังตรวจสอบการเชื่อมต่อ…");
  const [connectionTone, setConnectionTone] = useState("checking");
  const [background, setBackground] = useState<ProjectBackground>(fallbackBackground);
  const [committee, setCommittee] = useState<CommitteeMember[]>(fallbackCommittee);
  const [survey, setSurvey] = useState<ProjectSurvey>(fallbackSurvey);
  const [proposalPoints, setProposalPoints] = useState<ProposalPoint[]>(fallbackProposalPoints);
  const [measures, setMeasures] = useState<ProposalMeasure[]>(fallbackMeasures);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [content, setContent] = useState<ContentRow[]>([]);
  const [proposalDocuments, setProposalDocuments] = useState<ProposalDocumentRow[]>(defaultProposalDocuments);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [message, setMessage] = useState("");

  const config = () => ({ url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY });
  const headers = () => { const { key } = config(); return { apikey: key ?? "", Authorization: `Bearer ${token || key || ""}` }; };
  const api = useCallback(async (path: string, init?: RequestInit) => { const { url } = config(); return fetch(`${url}/rest/v1/${path}`, { ...init, headers: { ...headers(), "Content-Type": "application/json", ...(init?.headers ?? {}) } }); }, [token]);

  const reload = useCallback(async () => {
    const { url, key } = config(); if (!url || !key) return;
    const get = async (path: string) => { const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${token || key}` } }); return response.ok ? response.json() : []; };
    const [backgroundRows, committeeRows, surveyRows, proposalRows, measureRows, activityRows, attachmentRows, contentRows, proposalDocumentRows] = await Promise.all([
      get("project_background?id=eq.main&select=title,facts,closing,source_url,image_url"),
      get("committee_members?select=id,name,role,note,image_url,status,sort_order&order=sort_order.asc"),
      get("project_survey?id=eq.main&select=title,intro,highlights,source_url"),
      get("proposal_points?select=id,title,summary,sort_order,status&order=sort_order.asc"),
      get("proposal_measures?select=id,point_order,category_title,item_no,title,agencies,timeframe,detail,sort_order,status&order=sort_order.asc"),
      get("activities?select=id,slug,date_label,title,audience,location,participants_label,detail,cover_url,status,sort_order&order=sort_order.asc,created_at.desc"),
      get("activity_attachments?select=id,activity_id,label,kind,file_url,storage_path,sort_order&order=sort_order.asc"),
      get("content_items?select=id,kind,title,summary,detail,cover_url,source_url,media_type,channel,view_count,published_label,stat_label,status&order=created_at.desc"),
      get("proposal_documents?select=id,title,summary,file_url,sort_order,status&order=sort_order.asc"),
    ]);
    if (backgroundRows[0]) setBackground(backgroundRows[0]); if (committeeRows.length) setCommittee(committeeRows);
    if (surveyRows[0]) setSurvey({ ...fallbackSurvey, ...surveyRows[0], highlights: Array.isArray(surveyRows[0].highlights) && surveyRows[0].highlights.length ? surveyRows[0].highlights : fallbackSurvey.highlights });
    setCommittee(committeeRows); setProposalPoints(proposalRows.length ? proposalRows : fallbackProposalPoints); setMeasures(measureRows.length ? measureRows : fallbackMeasures);
    setActivities(activityRows.map((item: ActivityRow) => ({ ...item, attachments: attachmentRows.filter((attachment: ActivityAttachmentRow) => attachment.activity_id === item.id) })));
    // แสดงข้อมูลสำรองที่หน้าเว็บมีอยู่ในหลังบ้านด้วย โดยไม่เขียนทับหรือลบข้อมูลจากฐานข้อมูล
    setContent(withPageContentDefaults(contentRows));
    if (proposalDocumentRows.length) setProposalDocuments(proposalDocumentRows);
  }, [token]);

  useEffect(() => {
    const { url, key } = config();
    if (!url || !key) { setConnection("ยังไม่ได้ตั้งค่า Supabase"); setConnectionTone("warning"); return; }
    fetch(`${url}/rest/v1/content_items?select=id&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }).then((r) => { if (r.ok) { setConnection("เชื่อมต่อแล้ว"); setConnectionTone("success"); } else { setConnection("เชื่อมต่อไม่ได้ กรุณาตรวจ URL และ publishable key"); setConnectionTone("error"); } }).catch(() => { setConnection("เชื่อมต่อไม่ได้ กรุณาตรวจ URL และ publishable key"); setConnectionTone("error"); });
    const stored = window.localStorage.getItem(SESSION_KEY);
    if (!stored) { setSessionReady(true); return; }
    const restore = async () => {
      try {
        const saved = JSON.parse(stored) as StoredSession;
        let next = saved;
        if (saved.refresh_token && saved.expires_at && saved.expires_at * 1000 < Date.now() + 60_000) {
          const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: saved.refresh_token }) });
          if (response.ok) {
            const data = await response.json();
            next = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at };
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
          }
        }
        if (next.access_token) setToken(next.access_token); else window.localStorage.removeItem(SESSION_KEY);
      } catch { window.localStorage.removeItem(SESSION_KEY); }
      setSessionReady(true);
    };
    void restore();
  }, [reload]);

  useEffect(() => {
    if (token) void reload();
  }, [token, reload]);

  async function login() { const { url, key } = config(); if (!url || !key) return; const response = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); const data = await response.json(); if (!response.ok) { setMessage(data.error_description || "เข้าสู่ระบบไม่สำเร็จ"); return; } const stored: StoredSession = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at }; window.localStorage.setItem(SESSION_KEY, JSON.stringify(stored)); setToken(data.access_token); setPassword(""); setMessage("เข้าสู่ระบบแล้ว เซสชันจะถูกจดจำในเครื่องนี้"); }
  function logout() { window.localStorage.removeItem(SESSION_KEY); setToken(""); setMessage("ออกจากระบบแล้ว"); }
  async function write(path: string, method: string, body: unknown, success: string, prefer = "return=minimal") { if (!token) { setMessage("กรุณาเข้าสู่ระบบผู้ดูแลก่อนบันทึกข้อมูล"); return false; } const response = await api(path, { method, headers: { Prefer: prefer }, body: JSON.stringify(body) }); if (!response.ok) { const detail = await response.text(); if (response.status === 401) { window.localStorage.removeItem(SESSION_KEY); setToken(""); setMessage("เซสชันหมดอายุ กรุณาเข้าสู่ระบบผู้ดูแลอีกครั้ง"); } else { setMessage(`บันทึกไม่สำเร็จ (${response.status}) ${detail.slice(0, 180)}`); } } else { setMessage(success); await reload(); } return response.ok; }
  async function remove(path: string, success: string) { if (!token) { setMessage("กรุณาเข้าสู่ระบบผู้ดูแลก่อนลบข้อมูล"); return; } if (!window.confirm("ยืนยันการลบรายการนี้?")) return; const response = await api(path, { method: "DELETE", headers: { Prefer: "return=minimal" } }); if (response.ok) { setMessage(success); await reload(); } else { const detail = (await response.text()).slice(0, 220); setMessage(`ลบไม่สำเร็จ (${response.status}) ${detail || "ตรวจสอบสิทธิ์ผู้ดูแลและ RLS ใน Supabase"}`); } }
  const saveBackground = () => write("project_background?on_conflict=id", "POST", { id: "main", ...background, status: "published" }, "บันทึกความเป็นมาแล้ว", "resolution=merge-duplicates,return=minimal");
  const saveSurvey = () => write("project_survey?on_conflict=id", "POST", { id: "main", ...survey, status: "published" }, "บันทึกผลสำรวจแล้ว", "resolution=merge-duplicates,return=minimal");
  async function saveProposalPoint(item: ProposalPoint, index: number) { if (!item.title) { setMessage("กรุณากรอกหัวข้อสาระสำคัญ"); return; } await write(item.id ? `proposal_points?id=eq.${item.id}` : "proposal_points", item.id ? "PATCH" : "POST", { title: item.title, summary: item.summary, sort_order: index, status: item.status || "published" }, "บันทึกสาระสำคัญแล้ว"); }
  async function saveMeasure(item: ProposalMeasure, index: number) { if (!item.title) { setMessage("กรุณากรอกชื่อมาตรการ"); return; } await write(item.id ? `proposal_measures?id=eq.${item.id}` : "proposal_measures", item.id ? "PATCH" : "POST", { ...item, sort_order: index, status: item.status || "published" }, "บันทึกมาตรการแล้ว"); }
  async function saveMember(member: CommitteeMember) { const body = { name: member.name, role: member.role, note: member.note ?? "", image_url: member.image_url ?? "", status: "published", sort_order: committee.indexOf(member) }; await write(member.id ? `committee_members?id=eq.${member.id}` : "committee_members", member.id ? "PATCH" : "POST", body, "บันทึกข้อมูลอนุกรรมการแล้ว"); }
  async function saveActivity(item: ActivityRow) {
    if (!item.title) { setMessage("กรุณากรอกชื่อกิจกรรม"); return; }
    const activityBody = { slug: item.slug.trim() || generatedActivitySlug(), date_label: item.date_label, title: item.title, audience: item.audience, location: item.location, participants_label: item.participants_label, detail: item.detail, cover_url: item.cover_url, status: item.status || "draft", sort_order: item.sort_order ?? 0 };
    let activityId = item.id;
    const activityResponse = await api(item.id ? `activities?id=eq.${item.id}` : "activities", {
      method: item.id ? "PATCH" : "POST",
      headers: { Prefer: item.id ? "return=minimal" : "return=representation" },
      body: JSON.stringify(activityBody),
    });
    if (!activityResponse.ok) {
      const detail = await activityResponse.text();
      if (activityResponse.status === 401) {
        window.localStorage.removeItem(SESSION_KEY); setToken(""); setMessage("เซสชันหมดอายุ กรุณาเข้าสู่ระบบผู้ดูแลอีกครั้ง");
      } else if (activityResponse.status === 409 || detail.includes("activities_slug_key")) {
        setMessage("บันทึกไม่สำเร็จ: slug นี้มีอยู่แล้ว กรุณาเปลี่ยน slug ให้ไม่ซ้ำ");
      } else if (activityResponse.status === 403) {
        setMessage("บันทึกไม่สำเร็จ: บัญชีนี้ไม่มีสิทธิ์แก้ไขกิจกรรม กรุณาตรวจสอบ admin_users และ RLS ใน Supabase");
      } else {
        setMessage(`บันทึกไม่สำเร็จ (${activityResponse.status}) ${detail.slice(0, 180)}`);
      }
      return;
    }
    if (!activityId) {
      const created = await activityResponse.json() as ActivityRow[];
      activityId = created[0]?.id;
    }
    if (!activityId) { setMessage("บันทึกกิจกรรมไม่สำเร็จ: ไม่ได้รับรหัสกิจกรรมจากฐานข้อมูล"); return; }
    for (const attachment of item.attachments ?? []) {
      const response = await api(attachment.id ? `activity_attachments?id=eq.${attachment.id}` : "activity_attachments", { method: attachment.id ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ activity_id: activityId, label: attachment.label, kind: attachment.kind, file_url: attachment.file_url, storage_path: attachment.storage_path ?? "", sort_order: attachment.sort_order ?? 0 }) });
      if (!response.ok) { setMessage(`บันทึกไฟล์แนบไม่สำเร็จ (${response.status}) ${await response.text()}`); return; }
    }
    setMessage("บันทึกกิจกรรมและไฟล์แนบแล้ว"); await reload();
  }
  async function saveContent(item: ContentRow) { if (!item.title) { setMessage("กรุณากรอกชื่อรายการ"); return; } await write(item.id ? `content_items?id=eq.${item.id}` : "content_items", item.id ? "PATCH" : "POST", { ...item, detail: item.detail ?? item.summary }, "บันทึกรายการแล้ว"); }
  async function saveProposalDocument(item: ProposalDocumentRow) { if (!item.title || !item.file_url) { setMessage("กรุณากรอกชื่อเอกสารและ URL/ไฟล์ PDF"); return; } await write(item.id ? `proposal_documents?id=eq.${item.id}` : "proposal_documents", item.id ? "PATCH" : "POST", { title: item.title, summary: item.summary, file_url: item.file_url, sort_order: item.sort_order, status: item.status || "published" }, "บันทึกเอกสารข้อเสนอแนะแล้ว"); }
  async function uploadFile(file: File, onUploaded: (url: string) => void) {
    if (!token) { setMessage("กรุณาเข้าสู่ระบบผู้ดูแลก่อนอัปโหลดไฟล์"); return; }
    const { url, key } = config(); if (!url || !key) return;
    const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-"); const path = `${Date.now()}-${safeName}`;
    const response = await fetch(`${url}/storage/v1/object/site-media/${path}`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" }, body: file });
    if (!response.ok) { setMessage("อัปโหลดไม่สำเร็จ กรุณาสร้าง bucket site-media และตั้งค่า Storage policy ก่อน"); return; }
    onUploaded(`${url}/storage/v1/object/public/site-media/${path}`); setMessage(`อัปโหลด ${file.name} แล้ว กดบันทึกเพื่อเก็บ URL`);
  }
  async function seedWebsiteContent() {
    if (!token) { setMessage("กรุณาเข้าสู่ระบบผู้ดูแลก่อนนำเข้าข้อมูล"); return; }
    if (!window.confirm("นำเข้าข้อมูลกิจกรรม สื่อ เอกสาร และสิทธิที่มีอยู่บนเว็บไซต์เข้าสู่ฐานข้อมูล?")) return;
    const activityBody = defaultActivities.map((item) => ({ slug: item.slug, date_label: item.date, title: item.title, audience: item.audience, location: item.location, participants_label: item.participants, detail: item.detail, cover_url: item.image, status: "published" }));
    const response = await api("activities?on_conflict=slug", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(activityBody) });
    if (!response.ok) { setMessage("นำเข้ากิจกรรมไม่สำเร็จ กรุณาตรวจว่ามีตาราง activities แล้ว"); return; }
    const contentResponse = await api("content_items", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify([...defaultMedia, ...defaultRights]) });
    const pointsResponse = await api("proposal_points", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(fallbackProposalPoints.map((item, index) => ({ title: item.title, summary: item.summary, sort_order: index, status: "published" }))) });
    const measuresResponse = await api("proposal_measures", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(fallbackMeasures) });
    setMessage(contentResponse.ok && pointsResponse.ok && measuresResponse.ok ? "นำเข้าข้อมูลหน้าเว็บเข้าสู่หลังบ้านแล้ว" : "นำเข้ากิจกรรมแล้ว แต่บางหมวดอาจยังไม่เข้า กรุณาตรวจตารางฐานข้อมูล"); await reload();
  }
  const updateMember = (index: number, patch: Partial<CommitteeMember>) => setCommittee((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row));
  const updateActivity = (index: number, patch: Partial<ActivityRow>) => setActivities((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row));
  const updateContent = (index: number, patch: Partial<ContentRow>) => setContent((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row));
  const field = (value: string, onChange: (value: string) => void, placeholder: string, area = false) => area ? <textarea className="admin-wide-input" rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /> : <input className="admin-wide-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;

  function BackgroundPanel() { return <section className="admin-panel"><div className="panel-heading"><div><h2>ความเป็นมาของโครงการ</h2><p>เพิ่ม แก้ไข หรือลบแต่ละย่อหน้า และเพิ่มภาพประกอบได้</p></div><button className="primary-button" onClick={() => saveBackground()}>บันทึก</button></div>{field(background.title, (title) => setBackground({ ...background, title }), "หัวข้อ")}{field(background.image_url ?? "", (image_url) => setBackground({ ...background, image_url }), "URL ภาพประกอบ")}{<UploadInput label="อัปโหลดภาพประกอบความเป็นมา" accept="image/*" onUploaded={(url) => setBackground({ ...background, image_url: url })} />}{background.facts.map((fact, index) => <div className="admin-repeat-row" key={index}>{field(fact, (value) => setBackground({ ...background, facts: background.facts.map((item, i) => i === index ? value : item) }), `เนื้อหาย่อหน้า ${index + 1}`, true)}<button className="danger-button" onClick={() => setBackground({ ...background, facts: background.facts.filter((_, i) => i !== index) })}>ลบ</button></div>)}<button className="outline-button" onClick={() => setBackground({ ...background, facts: [...background.facts, ""] })}>+ เพิ่มย่อหน้า</button>{field(background.closing, (closing) => setBackground({ ...background, closing }), "ข้อความสรุป", true)}{field(background.source_url ?? "", (source_url) => setBackground({ ...background, source_url }), "ลิงก์ที่มาและข่าวสารโครงการ")}{<UploadInput label="อัปโหลดเอกสารที่มาและข่าวสารโครงการ (PDF)" accept=".pdf,application/pdf" onUploaded={(url) => setBackground({ ...background, source_url: url })} />}</section>; }
  function CommitteePanel() { return <section className="admin-panel"><div className="panel-heading"><div><h2>คณะอนุกรรมการ</h2><p>จัดการชื่อ ตำแหน่ง รูปภาพ และสถานะการเผยแพร่</p></div><button className="outline-button" onClick={() => setCommittee([...committee, { name: "", role: "อนุกรรมการ", note: "", image_url: "" }])}>+ เพิ่มบุคคล</button></div>{committee.map((member, index) => <div className="admin-record" key={member.id ?? `new-${index}`}>{field(member.name, (value) => updateMember(index, { name: value }), "ชื่อ-นามสกุล")}{field(member.role, (value) => updateMember(index, { role: value }), "ตำแหน่ง")}{field(member.image_url ?? "", (value) => updateMember(index, { image_url: value }), "URL รูปภาพ") }<UploadInput label="อัปโหลดภาพอนุกรรมการ" accept="image/*" onUploaded={(url) => updateMember(index, { image_url: url })} />{field(member.note ?? "", (value) => updateMember(index, { note: value }), "หมายเหตุ") }<div className="record-actions"><button className="primary-button" onClick={() => saveMember(member)}>บันทึก</button>{member.id && <button className="danger-button" onClick={() => remove(`committee_members?id=eq.${member.id}`, "ลบอนุกรรมการแล้ว")}>ลบ</button>}</div></div>)}</section>; }
  function SurveyPanel() { return <section className="admin-panel"><div className="panel-heading"><div><h2>ผลสำรวจสาธารณะ</h2><p>แก้ไขบทนำ ประเด็นสำคัญ และลิงก์รายงานฉบับเต็ม</p></div><button className="primary-button" onClick={() => saveSurvey()}>บันทึก</button></div>{field(survey.title, (title) => setSurvey({ ...survey, title }), "หัวข้อ")}{field(survey.intro, (intro) => setSurvey({ ...survey, intro }), "คำโปรย", true)}{survey.highlights.map((item, index) => <div className="admin-repeat-row" key={index}>{field(item, (value) => setSurvey({ ...survey, highlights: survey.highlights.map((row, i) => i === index ? value : row) }), `ข้อค้นพบ ${index + 1}`, true)}<button className="danger-button" onClick={() => setSurvey({ ...survey, highlights: survey.highlights.filter((_, i) => i !== index) })}>ลบ</button></div>)}<button className="outline-button" onClick={() => setSurvey({ ...survey, highlights: [...survey.highlights, ""] })}>+ เพิ่มข้อค้นพบ</button>{field(survey.source_url, (source_url) => setSurvey({ ...survey, source_url }), "ลิงก์รายงานฉบับเต็ม") }<UploadInput label="อัปโหลดรายงานผลสำรวจ PDF" accept=".pdf,application/pdf" onUploaded={(url) => setSurvey({ ...survey, source_url: url })} /></section>; }
  function ProposalPointsPanel() { return <section className="admin-panel"><div className="panel-heading"><div><h2>สาระสำคัญของข้อเสนอแนะ</h2><p>แก้ไข เพิ่ม ลบ และจัดลำดับประเด็นสำคัญ 4 ข้อที่แสดงบนหน้าเว็บไซต์</p></div><button className="outline-button" onClick={() => setProposalPoints([...proposalPoints, { title: "", summary: "", status: "published" }])}>+ เพิ่มประเด็น</button></div>{proposalPoints.map((item, index) => <div className="admin-record" key={item.id ?? `proposal-point-${index}`}>{field(item.title, (value) => setProposalPoints(proposalPoints.map((row, i) => i === index ? { ...row, title: value } : row)), "หัวข้อประเด็น")}{field(item.summary, (value) => setProposalPoints(proposalPoints.map((row, i) => i === index ? { ...row, summary: value } : row)), "รายละเอียดข้อเสนอแนะ", true)}<select className="admin-wide-input" value={item.status ?? "published"} onChange={(e) => setProposalPoints(proposalPoints.map((row, i) => i === index ? { ...row, status: e.target.value } : row))}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option><option value="archived">เก็บถาวร</option></select><div className="record-actions"><button className="primary-button" onClick={() => saveProposalPoint(item, index)}>บันทึก</button>{item.id && <button className="danger-button" onClick={() => remove(`proposal_points?id=eq.${item.id}`, "ลบประเด็นแล้ว")}>ลบ</button>}</div></div>)}</section>; }
  function MeasuresPanel() { return <section className="admin-panel"><div className="panel-heading"><div><h2>มาตรการเชิงข้อเสนอแนะ</h2><p>แก้ไข เพิ่ม ลบ และกำหนดหน่วยงานกับระยะเวลาของมาตรการแต่ละข้อ</p></div><button className="outline-button" onClick={() => setMeasures([...measures, { point_order: 1, category_title: "", item_no: 0, title: "", agencies: "", timeframe: "ระยะสั้น", detail: "", status: "published" }])}>+ เพิ่มมาตรการ</button></div>{measures.map((item, index) => <div className="admin-record measure-admin-record" key={item.id ?? `measure-${index}`}><div className="admin-form-grid">{field(String(item.point_order), (value) => setMeasures(measures.map((row, i) => i === index ? { ...row, point_order: Number(value) || 1 } : row)), "อยู่ในประเด็นที่ (1-4)")}{field(String(item.item_no), (value) => setMeasures(measures.map((row, i) => i === index ? { ...row, item_no: Number(value) || 0 } : row)), "ลำดับมาตรการ")}</div>{field(item.category_title, (value) => setMeasures(measures.map((row, i) => i === index ? { ...row, category_title: value } : row)), "ชื่อหมวด")}{field(item.title, (value) => setMeasures(measures.map((row, i) => i === index ? { ...row, title: value } : row)), "ชื่อมาตรการ")}{field(item.agencies, (value) => setMeasures(measures.map((row, i) => i === index ? { ...row, agencies: value } : row)), "เสนอถึงหน่วยงานใด")}{field(item.detail, (value) => setMeasures(measures.map((row, i) => i === index ? { ...row, detail: value } : row)), "รายละเอียดข้อเสนอแนะเชิงมาตรการ", true)}<select className="admin-wide-input" value={item.timeframe} onChange={(e) => setMeasures(measures.map((row, i) => i === index ? { ...row, timeframe: e.target.value as ProposalMeasure["timeframe"] } : row))}><option value="ระยะสั้น">ระยะสั้น</option><option value="ระยะกลาง">ระยะกลาง</option><option value="ระยะยาว">ระยะยาว</option></select><select className="admin-wide-input" value={item.status ?? "published"} onChange={(e) => setMeasures(measures.map((row, i) => i === index ? { ...row, status: e.target.value } : row))}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option><option value="archived">เก็บถาวร</option></select><div className="record-actions"><button className="primary-button" onClick={() => saveMeasure(item, index)}>บันทึก</button>{item.id && <button className="danger-button" onClick={() => remove(`proposal_measures?id=eq.${item.id}`, "ลบมาตรการแล้ว")}>ลบ</button>}</div></div>)}</section>; }
  function ActivityPanel() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expanded, setExpanded] = useState<string | number | null>(null);
    const records = activities.map((item, index) => ({ item, index })).filter(({ item }) => {
      const haystack = [item.title, item.location, item.audience, item.participants_label, item.date_label].join(" ").toLowerCase();
      return (!query.trim() || haystack.includes(query.trim().toLowerCase())) && (statusFilter === "all" || item.status === statusFilter);
    });
    return <section className="admin-panel activity-admin-panel">
      <div className="panel-heading">
        <div><h2>กิจกรรม</h2><p>จัดการกิจกรรมจำนวนมากได้ง่ายขึ้นด้วยการค้นหา กรองสถานะ และเปิดแก้ไขเฉพาะรายการที่ต้องการ</p></div>
        <button className="outline-button" onClick={() => setActivities([...activities, emptyActivity()])}>+ เพิ่มกิจกรรม</button>
      </div>
      <div className="activity-admin-toolbar">
        <div className="activity-admin-count"><strong>{activities.length}</strong><span>กิจกรรมทั้งหมด</span><i>แสดง {records.length} รายการ</i></div>
        <label className="activity-search"><span>ค้นหากิจกรรม</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ชื่อกิจกรรม สถานที่ หรือกลุ่มผู้เข้าร่วม" /></label>
        <label className="activity-filter"><span>สถานะ</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">ทุกสถานะ</option><option value="published">เผยแพร่</option><option value="draft">ฉบับร่าง</option><option value="archived">เก็บถาวร</option></select></label>
      </div>
      {records.length === 0 && <p className="admin-empty activity-empty">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข ลองเปลี่ยนคำค้นหาหรือสถานะ</p>}
      <div className="activity-admin-list">
        {records.map(({ item, index }) => {
          const identity = item.id ?? ("new-activity-" + index);
          return <details className="activity-admin-card" key={identity} open={!item.id || expanded === identity} onToggle={(e) => setExpanded(e.currentTarget.open ? identity : null)}>
            <summary>
              <span className="activity-order">{String(item.sort_order ?? 0).padStart(2, "0")}</span>
              <span className="activity-summary-copy"><b>{item.title || "กิจกรรมใหม่"}</b><small>{[item.date_label, item.location, item.audience].filter(Boolean).join(" · ") || "ยังไม่มีข้อมูลสรุป"}</small></span>
              <span className={`activity-status-badge ${item.status}`}>{item.status === "published" ? "เผยแพร่" : item.status === "archived" ? "เก็บถาวร" : "ฉบับร่าง"}</span>
              <span className="activity-chevron">⌄</span>
            </summary>
            <div className="admin-record">
              {field(item.title, (value) => updateActivity(index, { title: value }), "ชื่อกิจกรรม")}
              {field(item.slug, (value) => updateActivity(index, { slug: value }), "slug (เว้นว่างได้ ระบบสร้างให้อัตโนมัติ)")}
              <div className="admin-form-grid">{field(item.date_label, (value) => updateActivity(index, { date_label: value }), "วันที่")}{field(String(item.sort_order ?? 0), (value) => updateActivity(index, { sort_order: Number(value) || 0 }), "ลำดับการแสดงผล (น้อยขึ้นก่อน)")}{field(item.location, (value) => updateActivity(index, { location: value }), "สถานที่")}{field(item.audience, (value) => updateActivity(index, { audience: value }), "กลุ่มผู้เข้าร่วม")}{field(item.participants_label, (value) => updateActivity(index, { participants_label: value }), "จำนวนผู้เข้าร่วม")}</div>
              {field(item.detail, (value) => updateActivity(index, { detail: value }), "รายละเอียดกิจกรรม", true)}
              {field(item.cover_url, (value) => updateActivity(index, { cover_url: value }), "URL ภาพปก")}
              <UploadInput label="อัปโหลดภาพหน้าปกกิจกรรม" accept="image/*" onUploaded={(url) => updateActivity(index, { cover_url: url })} />
              <div className="activity-attachments"><h3>เอกสารและสื่อประกอบกิจกรรม</h3>{(item.attachments ?? []).map((attachment, attachmentIndex) => <div className="admin-repeat-row" key={attachment.id ?? (index + "-" + attachmentIndex)}>{field(attachment.label, (value) => updateActivity(index, { attachments: (item.attachments ?? []).map((row, i) => i === attachmentIndex ? { ...row, label: value } : row) }), "ชื่อไฟล์แนบ")}<select className="admin-wide-input" value={attachment.kind} onChange={(e) => updateActivity(index, { attachments: (item.attachments ?? []).map((row, i) => i === attachmentIndex ? { ...row, kind: e.target.value as ActivityAttachmentRow["kind"] } : row) })}><option value="summary">บันทึกประชุม</option><option value="image">ภาพกิจกรรม</option><option value="supporting">เอกสารนำเสนอวิทยากร</option><option value="reference">เอกสารอ้างอิง</option></select><a className="admin-file-link" href={attachment.file_url} target="_blank" rel="noreferrer">เปิดไฟล์ ↗</a><button className="danger-button" onClick={() => attachment.id ? remove("activity_attachments?id=eq." + attachment.id, "ลบไฟล์แนบแล้ว") : updateActivity(index, { attachments: (item.attachments ?? []).filter((_, i) => i !== attachmentIndex) })}>ลบ</button></div>)}<div className="admin-form-grid attachment-draft-fields">{field(item.pending_attachment_label ?? "", (value) => updateActivity(index, { pending_attachment_label: value }), "ชื่อไฟล์ เช่น ภาพเวทีรับฟัง")}<select className="admin-wide-input" value={item.pending_attachment_kind ?? "supporting"} onChange={(e) => updateActivity(index, { pending_attachment_kind: e.target.value as ActivityAttachmentRow["kind"] })}><option value="summary">บันทึกประชุม</option><option value="supporting">เอกสารนำเสนอวิทยากร</option><option value="image">ภาพกิจกรรม</option><option value="reference">เอกสารอ้างอิง</option></select>{field(item.pending_attachment_url ?? "", (value) => updateActivity(index, { pending_attachment_url: value }), "URL รูปภาพหรือไฟล์แนบ")}</div><button className="outline-button" type="button" onClick={() => { const url = item.pending_attachment_url?.trim(); if (!url) { setMessage("กรุณาใส่ URL รูปภาพหรือไฟล์แนบก่อนเพิ่ม"); return; } updateActivity(index, { attachments: [...(item.attachments ?? []), { label: item.pending_attachment_label?.trim() || "", kind: item.pending_attachment_kind ?? "supporting", file_url: url, sort_order: item.attachments?.length ?? 0 }], pending_attachment_label: "", pending_attachment_url: "" }); }}>+ เพิ่มจากลิงก์</button><UploadInput label="หรืออัปโหลด PDF / DOCX / รูปภาพ / วิดีโอ" accept=".pdf,.doc,.docx,image/*,video/*" onUploaded={(url) => updateActivity(index, { attachments: [...(item.attachments ?? []), { label: item.pending_attachment_label?.trim() || "", kind: item.pending_attachment_kind ?? "supporting", file_url: url, sort_order: item.attachments?.length ?? 0 }], pending_attachment_label: "" })} /></div>
              <select className="admin-wide-input" value={item.status} onChange={(e) => updateActivity(index, { status: e.target.value })}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option><option value="archived">เก็บถาวร</option></select>
              <div className="record-actions"><button className="primary-button" onClick={() => saveActivity(item)}>บันทึกกิจกรรมและไฟล์แนบ</button>{item.id && <button className="danger-button" onClick={() => remove("activities?id=eq." + item.id, "ลบกิจกรรมแล้ว")}>ลบ</button>}</div>
            </div>
          </details>;
        })}
      </div>
    </section>;
  }
  function UploadInput({ label, accept, onUploaded }: { label: string; accept: string; onUploaded: (url: string) => void }) { return <label className="upload-control"><span>{label}</span><input type="file" accept={accept} onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadFile(file, onUploaded); e.currentTarget.value = ""; }} /></label>; }
  function ProposalDocumentsPanel() { return <section className="admin-panel"><div className="panel-heading"><div><h2>เอกสารข้อเสนอแนะ</h2><p>จัดการรายการ PDF ที่แสดงในส่วนข้อเสนอแนะฉบับสมบูรณ์</p></div><button className="outline-button" onClick={() => setProposalDocuments([...proposalDocuments, { title: "", summary: "", file_url: "", sort_order: proposalDocuments.length + 1, status: "published" }])}>+ เพิ่มเอกสาร</button></div>{proposalDocuments.map((item, index) => <div className="admin-record" key={item.id ?? `proposal-document-${index}`}>{field(item.title, (value) => setProposalDocuments(proposalDocuments.map((row, i) => i === index ? { ...row, title: value } : row)), "ชื่อเอกสาร")}{field(item.summary, (value) => setProposalDocuments(proposalDocuments.map((row, i) => i === index ? { ...row, summary: value } : row)), "คำอธิบาย")}{field(item.file_url, (value) => setProposalDocuments(proposalDocuments.map((row, i) => i === index ? { ...row, file_url: value } : row)), "URL ไฟล์ PDF")}{field(String(item.sort_order), (value) => setProposalDocuments(proposalDocuments.map((row, i) => i === index ? { ...row, sort_order: Number(value) || index + 1 } : row)), "ลำดับการแสดงผล")}{<UploadInput label="อัปโหลด PDF" accept=".pdf,application/pdf" onUploaded={(url) => setProposalDocuments(proposalDocuments.map((row, i) => i === index ? { ...row, file_url: url } : row))} />}<select className="admin-wide-input" value={item.status} onChange={(e) => setProposalDocuments(proposalDocuments.map((row, i) => i === index ? { ...row, status: e.target.value } : row))}><option value="published">เผยแพร่</option><option value="draft">ฉบับร่าง</option><option value="archived">เก็บถาวร</option></select><div className="record-actions"><button className="primary-button" onClick={() => saveProposalDocument(item)}>บันทึก</button>{item.id && <button className="danger-button" onClick={() => remove(`proposal_documents?id=eq.${item.id}`, "ลบเอกสารแล้ว")}>ลบ</button>}</div></div>)}</section>; }
  function MediaPanel() {
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expanded, setExpanded] = useState<string | number | null>(null);
    const mediaRows = content.map((item, index) => ({ item, index })).filter(({ item }) => item.kind === "media");
    const visibleRows = mediaRows.filter(({ item }) => {
      const text = [item.title, item.summary, item.channel, item.source_url].join(" ").toLowerCase();
      const mediaType = item.media_type === "คลิปวิชาการ" ? "วิดีโอ" : (item.media_type || "วิดีโอ");
      return (!query.trim() || text.includes(query.trim().toLowerCase())) && (typeFilter === "all" || mediaType === typeFilter) && (statusFilter === "all" || item.status === statusFilter);
    });
    const addMedia = () => { const next = emptyContent("media"); setContent([...content, next]); setExpanded("new-content-" + content.length); };
    return <section className="admin-panel media-admin-panel">
      <div className="panel-heading"><div><h2>คลังสื่อ</h2><p>ค้นหา กรอง และเปิดแก้ไขทีละรายการ เพื่อจัดการสื่อจำนวนมากได้เร็วขึ้น</p></div><button className="primary-button" onClick={addMedia}>+ เพิ่มสื่อ</button></div>
      <div className="media-admin-toolbar"><div className="media-admin-count"><strong>{mediaRows.length}</strong><span>รายการทั้งหมด</span><i>แสดง {visibleRows.length} รายการ</i></div><label><span>ค้นหา</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ชื่อสื่อ ช่องทาง หรือ URL" /></label><label><span>ประเภท</span><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">ทุกประเภท</option><option value="วิดีโอ">วิดีโอ</option><option value="คลิปสั้น">คลิปสั้น</option><option value="อินโฟกราฟิก">อินโฟกราฟิก</option><option value="อัลบั้มภาพ">อัลบั้มภาพ</option><option value="คลิป Live">คลิป Live</option><option value="คลิปวิชาการ">คลิปวิชาการ</option></select></label><label><span>สถานะ</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">ทุกสถานะ</option><option value="published">เผยแพร่</option><option value="draft">ฉบับร่าง</option><option value="archived">เก็บถาวร</option></select></label></div>
      {visibleRows.length === 0 && <p className="admin-empty media-empty">ไม่พบสื่อที่ตรงกับเงื่อนไข ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>}
      <div className="media-admin-list">{visibleRows.map(({ item, index }) => { const identity = item.id ?? ("new-content-" + index); const displayType = item.media_type === "คลิปวิชาการ" ? "วิดีโอ" : (item.media_type || "วิดีโอ"); return <details className="media-admin-card" key={identity} open={!item.id || expanded === identity} onToggle={(e) => setExpanded(e.currentTarget.open ? identity : null)}><summary><span className="media-admin-thumb">{item.cover_url ? <img src={item.cover_url} alt="" /> : <b>{displayType.slice(0, 2)}</b>}</span><span className="media-admin-copy"><b>{item.title || "สื่อรายการใหม่"}</b><small>{[displayType, item.channel, item.published_label].filter(Boolean).join(" · ") || "ยังไม่มีข้อมูลสรุป"}</small></span><span className="media-admin-status">{item.status === "published" ? "เผยแพร่" : item.status === "archived" ? "เก็บถาวร" : "ฉบับร่าง"}</span><span className="media-admin-chevron">⌄</span></summary><div className="admin-record">{field(item.title, (value) => updateContent(index, { title: value }), "ชื่อรายการ")}{field(item.summary, (value) => updateContent(index, { summary: value }), "คำอธิบาย", true)}<select className="admin-wide-input" value={displayType} onChange={(e) => updateContent(index, { media_type: e.target.value })}><option value="วิดีโอ">ประเภท: วิดีโอ</option><option value="คลิปสั้น">ประเภท: คลิปสั้น</option><option value="อินโฟกราฟิก">ประเภท: อินโฟกราฟิก</option><option value="อัลบั้มภาพ">ประเภท: อัลบั้มภาพ</option><option value="คลิป Live">ประเภท: คลิป Live</option></select><div className="admin-form-grid">{field(item.channel ?? "", (value) => updateContent(index, { channel: value }), "ช่องทาง/ผู้เผยแพร่")}{field(item.published_label ?? "", (value) => updateContent(index, { published_label: value }), "วันที่เผยแพร่")}{field(item.stat_label ?? "", (value) => updateContent(index, { stat_label: value }), "วันที่ตรวจสอบข้อมูล")}{field(item.view_count ?? "", (value) => updateContent(index, { view_count: value }), "ยอดเข้าถึง (เก็บไว้ในหลังบ้าน)")}</div>{field(item.source_url, (value) => updateContent(index, { source_url: value }), "URL สื่อหรือเอกสาร")}{field(item.cover_url, (value) => updateContent(index, { cover_url: value }), "URL ภาพปก")}<div className="upload-row"><UploadInput label="อัปโหลดไฟล์ PDF / DOCX / รูปภาพ / วิดีโอ" accept=".pdf,.doc,.docx,image/*,video/*" onUploaded={(url) => updateContent(index, { source_url: url })} /><UploadInput label="อัปโหลดภาพปก" accept="image/*" onUploaded={(url) => updateContent(index, { cover_url: url })} /></div><select className="admin-wide-input" value={item.status} onChange={(e) => updateContent(index, { status: e.target.value })}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option><option value="archived">เก็บถาวร</option></select><div className="record-actions"><button type="button" className="primary-button" onClick={() => saveContent(item)}>บันทึก</button>{item.id && <button type="button" className="danger-button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void remove(`content_items?id=eq.${item.id}`, "ลบรายการแล้ว"); }}>ลบ</button>}</div></div></details>; })}</div>
    </section>;
  }
  function ContentPanel({ kind, heading }: { kind: ContentRow["kind"]; heading: string }) { const rows = content.map((item, index) => ({ item, index })).filter(({ item }) => item.kind === kind); return <section className="admin-panel"><div className="panel-heading"><div><h2>{heading}</h2><p>{kind === "proposal" ? "แยกแก้คำโปรยสั้นบนการ์ด และรายละเอียดที่เปิดใน modal" : "เพิ่ม แก้ไข ลบ URL ภาพปก เอกสาร และสถานะการเผยแพร่"}</p></div><button className="outline-button" onClick={() => setContent([...content, emptyContent(kind)])}>+ เพิ่มรายการ</button></div>{rows.length === 0 && <p className="admin-empty">ยังไม่มีรายการในหมวดนี้ กด “เพิ่มรายการ” เพื่อเริ่มต้น</p>}{rows.map(({ item, index }) => <div className="admin-record" key={item.id ?? `new-content-${index}`}>{field(item.title, (value) => updateContent(index, { title: value }), "ชื่อรายการ")}{field(item.summary, (value) => updateContent(index, { summary: value }), kind === "proposal" ? "คำโปรยสั้นบนการ์ด" : "คำอธิบาย", true)}{kind === "proposal" && field(item.detail ?? item.summary, (value) => updateContent(index, { detail: value }), "รายละเอียดฉบับเต็มใน modal", true)}{field(item.source_url, (value) => updateContent(index, { source_url: value }), "URL สื่อหรือเอกสาร")}{field(item.cover_url, (value) => updateContent(index, { cover_url: value }), "URL ภาพปก") }<div className="upload-row"><UploadInput label="อัปโหลดไฟล์ PDF / DOCX / วิดีโอ" accept=".pdf,.doc,.docx,video/*" onUploaded={(url) => updateContent(index, { source_url: url })} /><UploadInput label="อัปโหลดภาพปก" accept="image/*" onUploaded={(url) => updateContent(index, { cover_url: url })} /></div><select className="admin-wide-input" value={item.status} onChange={(e) => updateContent(index, { status: e.target.value })}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option><option value="archived">เก็บถาวร</option></select><div className="record-actions"><button className="primary-button" onClick={() => saveContent(item)}>บันทึก</button>{item.id && <button className="danger-button" onClick={() => remove(`content_items?id=eq.${item.id}`, "ลบรายการแล้ว")}>ลบ</button>}</div></div>)}</section>; }

  const panels: Record<string, ReactNode> = { "ความเป็นมา": BackgroundPanel(), "คณะอนุกรรมการ": CommitteePanel(), "ผลสำรวจ": SurveyPanel(), "กิจกรรม": ActivityPanel(), "คลังสื่อ": MediaPanel(), "เอกสาร": ContentPanel({ kind: "document", heading: "เอกสารเผยแพร่" }), "สาระสำคัญ": ProposalPointsPanel(), "มาตรการ": MeasuresPanel(), "ข้อเสนอแนะ": ContentPanel({ kind: "proposal", heading: "ข้อเสนอแนะ" }), "เอกสารข้อเสนอแนะ": ProposalDocumentsPanel() };
  const menu = Object.keys(panels);
  if (!sessionReady) return <main className="admin-shell"><section className="admin-content"><div className="admin-panel"><p className="admin-empty">กำลังตรวจสอบเซสชันผู้ดูแล…</p></div></section></main>;
  return <main className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><span className="nhrc-mark">กสม.</span><span><b>ค่าไฟแฟร์</b><small>ระบบจัดการเนื้อหา</small></span></div><nav>{menu.map((label) => <button className={active === label ? "selected" : ""} onClick={() => setActive(label)} key={label}>{label}</button>)}</nav><div className="admin-status"><span className="status-dot"></span><span><b>{connection}</b><small>สถานะการเชื่อมต่อฐานข้อมูล</small></span></div></aside><section className="admin-content"><header className="admin-top"><div><p className="admin-kicker">CONTENT MANAGEMENT / {active.toUpperCase()}</p><h1>{active}</h1></div><div className="admin-actions"><button className="outline-button" onClick={seedWebsiteContent}>นำเข้าข้อมูลเดิม</button><a className="outline-button" href="/">ดูเว็บไซต์ ↗</a>{token && <button className="outline-button" onClick={logout}>ออกจากระบบ</button>}</div></header><div className={`admin-notice ${connectionTone}`}><span>i</span><p><b>{connection}</b><br />เพิ่ม แก้ไข ลบ อัปโหลดไฟล์ และเปลี่ยนสถานะเนื้อหาได้จากแต่ละหมวด</p></div>{!token && <section className="admin-panel"><div className="panel-heading"><div><h2>เข้าสู่ระบบผู้ดูแล</h2><p>เข้าสู่ระบบครั้งเดียว แล้วจัดการได้ทุกหมวด</p></div></div><div className="admin-form-row"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมลผู้ดูแล" type="email" /><input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" type="password" /><button className="primary-button" onClick={login}>เข้าสู่ระบบ</button></div>{message && <p className="admin-save-message">{message}</p>}</section>}{token && message && <p className="admin-save-message">{message}</p>}{token ? panels[active] : <section className="admin-panel"><p className="admin-empty">กรุณาเข้าสู่ระบบเพื่อจัดการเนื้อหาเว็บไซต์</p></section>}</section></main>;
}

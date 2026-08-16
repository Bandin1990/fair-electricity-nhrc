import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ค่าไฟแฟร์ — สิทธิในพลังงานที่เป็นธรรม | กสม.",
  description: "พื้นที่รวบรวมผลการดำเนินงาน เสียงสะท้อน และข้อเสนอแนะของ กสม. เพื่อค่าไฟที่เหมาะสมและเป็นธรรมต่อภาคครัวเรือน",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}

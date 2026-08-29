import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/shared/ui/site-header/SiteHeader";

export const metadata: Metadata = {
  title: "Zustand Practice Lab",
  description: "Zustand 상태 관리 기초를 단계별로 연습하는 앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

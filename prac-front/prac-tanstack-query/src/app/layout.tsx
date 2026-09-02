import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/shared/ui/site-header/SiteHeader";

export const metadata: Metadata = {
  title: "TanStack Query Practice Lab",
  description: "TanStack Query의 서버 상태 관리를 단계별로 연습하는 앱",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}

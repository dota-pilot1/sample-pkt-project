import type { Metadata } from "next";
import SiteHeader from "@/shared/ui/site-header/SiteHeader";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axios & Fetch Practice Lab",
  description: "fetch와 Axios의 HTTP 통신 흐름을 단계별로 연습하는 앱",
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

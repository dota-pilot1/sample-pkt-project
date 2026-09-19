import type { Metadata } from "next";
import { QueryProvider } from "./providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVA AX | AI-Driven BSS",
  description: "통신 상품·요금제 AI 전환 운영 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

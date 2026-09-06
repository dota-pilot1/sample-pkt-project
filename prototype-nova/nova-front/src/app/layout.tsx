import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVA BSS 운영 콘솔",
  description: "통신 상품·요금제 운영 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

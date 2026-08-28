import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Zod Practice Lab",
  description: "Zod 스키마와 런타임 검증을 단계별로 연습하는 앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><Header />{children}</body></html>;
}

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/app/providers";

export const metadata: Metadata = { title: "React Hook Form 실험실", description: "로그인 없는 폼 학습 앱" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><Providers>{children}</Providers></body></html>;
}

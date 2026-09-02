"use client";

import { Database, PackageSearch } from "lucide-react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-muted/30 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-background shadow-xl lg:grid-cols-2">
        <section className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-8 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="grid size-8 place-items-center rounded-lg bg-white/15"><PackageSearch className="h-4 w-4" /></span>
              PKT LOT Lab
            </div>
            <p className="mt-20 text-xs font-semibold tracking-[0.18em] text-cyan-200">FRONTEND PRACTICE</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">LOT 목록을<br />처음부터 만듭니다.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">TanStack Table과 AG Grid로 반도체 PKT LOT 관리 화면을 비교 구현하는 실습 프로젝트입니다.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300"><Database className="h-4 w-4 text-cyan-300" /> 데이터 관리 · 상태 추적 · 테이블 UX</div>
        </section>
        <section className="flex min-h-[560px] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

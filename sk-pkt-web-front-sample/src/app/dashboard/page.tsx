"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Code2,
  Factory,
  Gauge,
  Layers3,
  MapPin,
  Route,
  Settings2,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

const learningSteps = [
  { label: "기준정보", detail: "품목 · BOM · 재고", state: "진행 중" },
  { label: "계획", detail: "MRP · 생산계획", state: "다음 단계" },
  { label: "실행", detail: "작업지시 · 설비 · 생산실적", state: "예정" },
  { label: "분석", detail: "모니터링 · 품질 · 이력추적", state: "예정" },
];

const quickLinks = [
  { href: "/bom-mrp/items", title: "품목 관리", description: "제품·자재 기준정보부터 확인합니다.", icon: Boxes },
  { href: "/bom-mrp/boms", title: "BOM 관리", description: "제품을 구성하는 자재와 소요량을 봅니다.", icon: Layers3 },
  { href: "/production-plans", title: "생산계획", description: "무엇을 언제 얼마나 만들지 계획합니다.", icon: CalendarDays },
  { href: "/work-orders", title: "작업지시", description: "계획을 현장 실행 단위로 전환합니다.", icon: ClipboardList },
];

export default function DashboardPage() {
  return <RequireAuth><DashboardInner /></RequireAuth>;
}

function DashboardInner() {
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap">("overview");

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ProjectBrief />

        <section className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">MES PROTOTYPE</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">프로젝트 메인</h1>
            </div>
            <div className="inline-flex rounded-lg border border-border bg-card p-1 shadow-sm" role="tablist" aria-label="메인 페이지 탭">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                프로젝트 개요
              </TabButton>
              <TabButton active={activeTab === "roadmap"} onClick={() => setActiveTab("roadmap")}>
                학습 로드맵
              </TabButton>
            </div>
          </div>

          {activeTab === "overview" ? <OverviewTab /> : <RoadmapTab />}
        </section>
      </div>
    </main>
  );
}

function ProjectBrief() {
  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-20">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary">
        <Factory className="h-4 w-4" /> PROJECT BRIEF
      </div>
      <h2 className="mt-4 text-xl font-bold leading-tight">SK하이닉스<br />PKT 프로젝트</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">MES 실무 연습 프로젝트</p>

      <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
        <BriefRow label="기간" value="2026.08.01 - 2026.12.31" />
        <BriefRow label="위치" value="이천" icon={MapPin} />
        <BriefRow label="기술" value="Spring Boot · Java · React" icon={Code2} />
        <BriefRow label="현재 단계" value="기준정보" icon={Target} accent />
      </div>

      <div className="mt-6 rounded-xl bg-muted/60 p-4">
        <p className="text-xs font-semibold text-foreground">프로젝트 목표</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          제조 MES의 도메인과 데이터 흐름을 직접 구현하고, 실무 프로젝트에서 설명할 수 있는 백엔드·프론트엔드 역량을 만든다.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {['일반 제조 MES', '반도체 확장', 'DDD + FSD'].map((tag) => (
          <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{tag}</span>
        ))}
      </div>
    </aside>
  );
}

function BriefRow({ label, value, icon: Icon, accent = false }: { label: string; value: string; icon?: LucideIcon; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className={`text-right text-xs font-medium ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Factory className="h-3.5 w-3.5" /> MES 학습 프로젝트
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">제조 현장의 흐름을 하나씩 연결합니다.</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            품목·BOM부터 생산계획, 작업지시, 설비와 생산실적까지 연결하는 MES 프로토타입입니다. 현재는 일반 제조 공정으로 기본기를 익히고, 이후 반도체 MES의 LOT·공정·수율·이력 추적으로 확장합니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/bom-mrp/items" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">학습 시작하기 <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/monitoring" className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent">모니터링 보기 <Gauge className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewCard icon={Route} eyebrow="PROJECT FLOW" title="기준정보 → 실행 → 분석" description="무엇을 만들지 정의하고, 계획을 실행한 뒤 결과를 추적합니다." />
        <OverviewCard icon={Settings2} eyebrow="TECH STACK" title="Spring Boot + React" description="DDD 4-Layer 백엔드와 FSD 프론트엔드 구조를 연습합니다." />
        <OverviewCard icon={CheckCircle2} eyebrow="CURRENT FOCUS" title="품목·BOM·MRP" description="모든 생산 흐름의 출발점인 기준정보와 자재 소요량을 학습합니다." />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">START HERE</p><h2 className="mt-2 text-xl font-bold tracking-tight">먼저 살펴볼 기능</h2></div>
          <p className="text-sm text-muted-foreground">품목 → BOM → 계획 → 작업지시 순서</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return <Link key={link.href} href={link.href} className="group rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span></div><h3 className="mt-4 text-sm font-bold">{link.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{link.description}</p></Link>;
          })}
        </div>
      </section>
    </div>
  );
}

function RoadmapTab() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">LEARNING ROADMAP</p><h2 className="mt-2 text-xl font-bold tracking-tight">학습 진행 흐름</h2></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">1 / 4 단계</span></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {learningSteps.map((step, index) => <div key={step.label} className="relative">{index < learningSteps.length - 1 && <div className="absolute left-[calc(50%+1.25rem)] right-[-0.75rem] top-5 hidden h-px bg-border sm:block" />}<div className="relative rounded-xl border border-border bg-background p-3 sm:min-h-32"><div className="flex items-center gap-2"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span><span className="text-xs font-medium text-muted-foreground">{step.state}</span></div><h3 className="mt-4 text-sm font-bold">{step.label}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p></div></div>)}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"><p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">PROJECT PURPOSE</p><h2 className="mt-2 text-xl font-bold tracking-tight">왜 만드는가?</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">실무 MES에서 사용하는 도메인, 데이터 흐름, API, 화면을 작은 수직 기능으로 끝까지 구현하며 프로젝트에서 설명할 수 있는 제조 시스템 역량을 만드는 것이 목적입니다.</p><div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm leading-6 text-foreground"><span className="font-semibold">핵심 질문</span><br />무엇을, 어떤 공정과 설비로, 언제, 얼마나 만들었고 결과가 어땠는가?</div></div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"><p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">NEXT DOMAIN</p><h2 className="mt-2 text-xl font-bold tracking-tight">반도체 MES 확장</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">일반 제조의 공통 흐름을 익힌 뒤 제품·웨이퍼·LOT, 공정 ROUTE, RECIPE, 검사 결과와 수율, LOT 이력 추적으로 확장합니다.</p><div className="mt-5 flex flex-wrap gap-2">{['LOT', '공정 ROUTE', 'RECIPE', '수율', '이력 추적'].map((item) => <span key={item} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">{item}</span>)}</div></div>
      </section>
    </div>
  );
}

function OverviewCard({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-4 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 text-base font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Factory,
  Package,
  Route,
  SearchCheck,
  TestTube2,
  Wrench,
} from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

const practiceItems = [
  ["제품·Package 기준정보", "제품 코드, Package 타입, 규격을 등록하고 조회하기", "/bom-mrp/items", Package],
  ["공정 Route 관리", "PKT 제조 공정 순서를 정의하고 버전 관리하기", "/work-orders", Route],
  ["작업지시 생성", "제품·수량·납기 기준으로 제조 작업지시 만들기", "/work-orders", CheckCircle2],
  ["LOT 생성·분할", "작업지시에서 LOT를 만들고 수량·상태 관리하기", "/work-orders", Factory],
  ["수작업 시작·종료", "작업자 입력으로 공정 시작, 완료, 대기 상태 기록하기", "/work-orders", CheckCircle2],
  ["설비·Tester 배정", "LOT와 설비를 연결하고 작업 가능 상태 확인하기", "/equipment-reservations", Wrench],
  ["Test Program·Recipe", "검사 조건과 프로그램 버전을 LOT에 적용하기", "/production-plans", TestTube2],
  ["검사 결과·불량 코드", "Pass/Fail, Fail Bin, 불량 사유를 입력하기", "/monitoring", SearchCheck],
  ["실적·수율 대시보드", "양품·불량·수율·작업시간을 집계하고 비교하기", "/monitoring", SearchCheck],
  ["LOT 이력·추적", "누가·언제·어떤 공정과 설비에서 작업했는지 조회하기", "/monitoring", Route],
] as const;

const projectFacts = [
  ["프로젝트 성격", "MES 업무 흐름 학습"],
  ["핵심 관점", "수작업 전산화·추적"],
  ["현재 단계", "기준정보 설계"],
  ["확장 방향", "실적·수율 분석"],
] as const;

export default function PktMainPage() {
  return (
    <RequireAuth>
      <main className="min-h-[calc(100vh-3.5rem)] bg-background px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex h-full flex-col">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <TestTube2 className="h-3.5 w-3.5" />
                  SK PKT MES LEARNING PROJECT
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
                  Package Test 업무를
                  <br />MES로 연결합니다.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                  제품·LOT·공정·설비·작업실적·검사 결과의 흐름을 하나의 시스템으로 연결하며,
                  PKT 제조 수작업 업무를 직접 구현해보는 학습 프로젝트입니다.
                </p>

                <div className="mt-8 rounded-xl bg-muted/50 p-4 sm:p-5">
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">PROJECT OVERVIEW</p>
                  <h2 className="mt-2 text-xl font-bold">프로젝트 개요</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    실제 현장 요구사항이 확인되기 전까지는 PKT 업무의 핵심 흐름을 가정해 작은 수직 기능으로 완성합니다.
                  </p>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {projectFacts.map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-background/70 p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-xl border border-border p-4">
                    <p className="font-semibold">현재 확인된 범위</p>
                    <p className="mt-1 leading-6 text-muted-foreground">이천 SK하이닉스 PKT 제조 수작업 업무 시스템 구축을 가정한 MES 학습</p>
                  </div>
                  <div className="rounded-xl border border-dashed border-border p-4">
                    <p className="flex items-center gap-2 font-semibold"><CircleHelp className="h-4 w-4 text-primary" />확인 후 확장할 정보</p>
                    <p className="mt-1 leading-6 text-muted-foreground">실제 대상 공정, SmartFX 연동 범위, 데이터 항목, 담당자별 권한</p>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <Link href="/bom-mrp/items" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                    기준정보부터 시작 <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">PRACTICE 10</p>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl">실습해볼 10가지</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">기준정보부터 실행, 결과 분석과 이력 추적까지 순서대로 연결합니다.</p>
                </div>
                <span className="hidden shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">기초 → 현장 → 분석</span>
              </div>

              <div className="mt-7 divide-y divide-border rounded-xl border border-border">
                {practiceItems.map(([title, description, href, Icon], index) => (
                  <Link key={title} href={href} className="group flex items-start gap-3 p-4 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-muted/40 sm:gap-4 sm:p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">{String(index + 1).padStart(2, "0")}</span>
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-muted/50 p-4 text-sm">
                <p className="font-semibold">첫 번째 구현 흐름</p>
                <p className="mt-2 leading-6 text-muted-foreground">제품 등록 → LOT 생성 → 테스트 프로그램 선택 → Tester 배정 → 테스트 실행 → 결과·수율 계산 → 이력 조회</p>
                <div className="mt-3 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-primary" />기준정보 → 실행 → 실적 → 분석</div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}

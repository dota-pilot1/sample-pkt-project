"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Boxes,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  FlaskConical,
  GitBranch,
  Grid3X3,
  History,
  ListFilter,
  Network,
  PackageSearch,
  RadioTower,
  ShieldAlert,
  SlidersHorizontal,
  TableProperties,
  Tags,
  TimerReset,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { missions } from "@/features/missions";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

const iconByType: Record<(typeof missions)[number]["icon"], LucideIcon> = {
  grid: Grid3X3,
  table: TableProperties,
  detail: PackageSearch,
  tabs: ClipboardCheck,
  box: Boxes,
  route: GitBranch,
  server: Wrench,
  search: ListFilter,
  timeline: History,
  badge: Tags,
  form: SlidersHorizontal,
  inspect: FlaskConical,
  drilldown: Network,
  chart: Activity,
  monitor: RadioTower,
  alert: AlertTriangle,
  audit: FileClock,
  batch: TimerReset,
  error: ShieldAlert,
  state: GitBranch,
};

export default function MainPage() {
  return (
    <RequireAuth>
      <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20 px-4 py-8 sm:px-8 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-primary">PKT LOT LAB · FRONTEND PRACTICE</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">20가지 도전과제</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">LOT 관리의 기본부터 PKT 현장 UX까지, 한 장씩 구현하며 연결합니다.</p>
            </div>
            <span className="w-fit rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">1 / 20 시작 가능</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {missions.map((mission) => {
              const Icon = iconByType[mission.icon];
              const isFirst = mission.number === 1;
              return (
                <Link
                  key={mission.id}
                  href={`/missions/${mission.id}`}
                  className="group relative flex min-h-48 flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid size-10 place-items-center rounded-lg ${isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}><Icon className="h-5 w-5" /></span>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">{String(mission.number).padStart(2, "0")}</span>
                  </div>
                  <h2 className="mt-6 text-base font-bold leading-6 text-foreground">{mission.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{mission.focus}</p>
                  <span className={`mt-auto inline-flex items-center gap-1 pt-5 text-xs font-semibold ${isFirst ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{isFirst ? "첫 구현 대상" : "실습 페이지 열기"}<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}

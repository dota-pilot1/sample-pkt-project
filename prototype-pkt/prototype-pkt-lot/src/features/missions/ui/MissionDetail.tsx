"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, Grid3X3, TableProperties } from "lucide-react";
import { findMission } from "@/features/missions/model/missionCatalog";

export function MissionDetail() {
  const params = useParams<{ missionId: string }>();
  const mission = findMission(params.missionId);

  if (!mission) {
    return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-sm text-muted-foreground">존재하지 않는 실습 페이지입니다.</p></main>;
  }

  const isReady = mission.number === 1;
  const Icon = mission.number === 1 ? Grid3X3 : mission.number === 2 ? TableProperties : CircleDashed;

  return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20 px-4 py-8 sm:px-8">
        <section className="mx-auto max-w-5xl">
          <Link href="/main" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />도전과제 목록</Link>
          <article className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <div className="flex items-start justify-between gap-5">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isReady ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{isReady ? "첫 구현 대상" : "준비 중"}</span>
            </div>
            <p className="mt-8 text-xs font-bold tracking-[0.16em] text-muted-foreground">MISSION {String(mission.number).padStart(2, "0")}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{mission.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{mission.focus}</p>
            <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 p-5">
              <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-primary" />이 페이지에서 만들 기능</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">실습 구현을 시작하면 요구사항, API 계약, 화면 상태와 검증 항목을 이 페이지에 연결합니다.</p>
            </div>
            {isReady && <Link href="/lots" className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">AG Grid LOT 목록 시작 <ArrowRight className="h-4 w-4" /></Link>}
          </article>
        </section>
      </main>
  );
}

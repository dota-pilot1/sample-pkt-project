"use client";

import Link from "next/link";
import { useSessionQuery } from "@/entities/session/model/useSessionQuery";
import EquipmentWorkspace from "@/widgets/equipment-workspace/ui/EquipmentWorkspace";

/** Level 1 세션을 확인한 뒤에만 공통 fetch 래퍼 기반 CRUD 작업공간을 연다. */
export default function LevelTwoPractice() {
  const sessionQuery = useSessionQuery();

  if (sessionQuery.isPending) {
    return <section className="session-loading" role="status"><span className="spinner" />서버 세션을 확인하는 중…</section>;
  }
  if (sessionQuery.isError) {
    return <section className="session-loading error-state" role="alert">{sessionQuery.error.message}</section>;
  }
  if (!sessionQuery.data.user) {
    return (
      <section className="card level-gate">
        <p className="lesson-label">LEVEL 1 REQUIRED</p>
        <h2>인증 세션이 필요합니다</h2>
        <p>Level 1에서 회원가입 또는 로그인한 뒤 보호된 설비 CRUD를 시작하세요.</p>
        <Link href="/level-1" className="primary-link">Level 1에서 로그인</Link>
      </section>
    );
  }

  return <EquipmentWorkspace user={sessionQuery.data.user} />;
}

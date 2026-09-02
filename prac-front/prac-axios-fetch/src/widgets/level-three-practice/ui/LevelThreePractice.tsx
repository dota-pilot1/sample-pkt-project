"use client";

import Link from "next/link";
import { useSessionQuery } from "@/entities/session/model/useSessionQuery";
import AxiosEquipmentWorkspace from "@/widgets/axios-equipment-workspace/ui/AxiosEquipmentWorkspace";

/** Level 3 진입 전 서버 세션을 확인하고 인증된 사용자만 Axios CRUD를 노출한다. */
export default function LevelThreePractice() {
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
        <p>보호된 Axios CRUD를 실행하려면 먼저 Level 1에서 로그인하세요.</p>
        <Link href="/level-1" className="primary-link">Level 1에서 로그인</Link>
      </section>
    );
  }

  return <AxiosEquipmentWorkspace user={sessionQuery.data.user} />;
}

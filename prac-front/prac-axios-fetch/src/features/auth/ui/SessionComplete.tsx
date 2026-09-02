"use client";

import Link from "next/link";
import type { SessionUser } from "@/entities/session/model/session";
import { useLogoutMutation } from "@/entities/session/model/useSessionQuery";

/** Level 1 인증 완료 상태를 요약하고 다음 학습인 보호된 CRUD로 연결한다. */
export default function SessionComplete({ user }: { user: SessionUser }) {
  const logoutMutation = useLogoutMutation();

  return (
    <section className="level-complete-grid">
      <article className="card level-complete-card">
        <p className="lesson-label">LEVEL 1 COMPLETE</p>
        <h2>서버 세션이 준비됐습니다</h2>
        <p className="card-description">
          회원가입 또는 로그인 응답의 HttpOnly 쿠키로 현재 사용자를 복원했습니다.
        </p>
        <div className="session-profile">
          <span className="session-dot" />
          <div>
            <strong>{user.displayName}</strong>
            <small>@{user.username} · SQLite session</small>
          </div>
        </div>
        <div className="level-complete-actions">
          <Link href="/level-2" className="primary-link">Level 2에서 설비 CRUD 시작</Link>
          <button type="button" className="ghost-button" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "로그아웃 중…" : "로그아웃"}
          </button>
        </div>
      </article>

      <aside className="card lesson-card auth-flow-card">
        <p className="lesson-label">AUTH BOUNDARY</p>
        <h2>Level 1에서 확인한 것</h2>
        <ol className="topics">
          <li><b>회원가입</b><span>scrypt 해시와 SQLite 사용자 저장</span></li>
          <li><b>로그인</b><span>아이디·비밀번호 검증과 세션 발급</span></li>
          <li><b>세션 복원</b><span>GET /api/auth/me와 HttpOnly Cookie</span></li>
          <li><b>로그아웃</b><span>DB 세션과 브라우저 쿠키 제거</span></li>
        </ol>
      </aside>
    </section>
  );
}

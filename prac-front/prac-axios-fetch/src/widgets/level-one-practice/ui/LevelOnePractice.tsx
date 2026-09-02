"use client";

import { useSessionQuery } from "@/entities/session/model/useSessionQuery";
import AuthEntry from "@/features/auth/ui/AuthEntry";
import SessionComplete from "@/features/auth/ui/SessionComplete";

export default function LevelOnePractice() {
  const sessionQuery = useSessionQuery();

  if (sessionQuery.isPending) {
    return <section className="session-loading" role="status"><span className="spinner" />서버 세션을 확인하는 중…</section>;
  }
  if (sessionQuery.isError) {
    return <section className="session-loading error-state" role="alert">{sessionQuery.error.message}</section>;
  }
  if (!sessionQuery.data.user) return <AuthEntry />;

  return <SessionComplete user={sessionQuery.data.user} />;
}

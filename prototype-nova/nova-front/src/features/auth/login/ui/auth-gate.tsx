"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUTH_EXPIRED_EVENT, useAuthStore } from "../model/auth-store";

export function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    // 화면을 처음 열면 탭에 남아 있는 로그인 정보를 Zustand에 다시 넣는다.
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const handleExpiredAuth = () => signOut();
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);
  }, [signOut]);

  useEffect(() => {
    // 로그인 정보를 다 읽은 뒤에도 사용자가 없을 때만 로그인 화면으로 보낸다.
    // 읽기 전에는 user가 비어 있어도 성급하게 이동하면 안 된다.
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    // 로그인 정보 확인이 끝날 때까지 보호된 화면을 보여 주지 않는다.
    return <main className="min-h-screen bg-[var(--soft)]" aria-busy="true" />;
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../model/auth-store";

export function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    return <main className="min-h-screen bg-[var(--soft)]" aria-busy="true" />;
  }

  return <>{children}</>;
}

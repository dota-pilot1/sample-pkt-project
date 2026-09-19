"use client";

import { create } from "zustand";
import type { LoggedInUser } from "@/entities/user/model/types";

const SESSION_KEY = "nova-auth-user";

type AuthState = {
  user: LoggedInUser | null;
  hydrated: boolean;
  hydrate: () => void;
  signIn: (user: LoggedInUser) => void;
  signOut: () => void;
};

function parseLoggedInUser(value: string | null): LoggedInUser | null {
  if (!value) return null;

  try {
    const user: unknown = JSON.parse(value);
    if (
      typeof user === "object" &&
      user !== null &&
      typeof (user as LoggedInUser).id === "number" &&
      typeof (user as LoggedInUser).email === "string" &&
      typeof (user as LoggedInUser).displayName === "string" &&
      Array.isArray((user as LoggedInUser).roleCodes)
    ) {
      return user as LoggedInUser;
    }
  } catch {
    // 손상된 탭 세션은 로그아웃 상태로 정리한다.
  }

  window.sessionStorage.removeItem(SESSION_KEY);
  return null;
}

/**
 * TanStack Query의 서버 요청 결과를 화면 전역 로그인 상태로 연결한다.
 * API가 토큰을 발급하기 전까지는 사용자 정보만 브라우저 탭 세션에 보관한다.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  hydrate: () => {
    const user = parseLoggedInUser(window.sessionStorage.getItem(SESSION_KEY));
    set({ user, hydrated: true });
  },
  signIn: (user) => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    set({ user, hydrated: true });
  },
  signOut: () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    set({ user: null, hydrated: true });
  },
}));

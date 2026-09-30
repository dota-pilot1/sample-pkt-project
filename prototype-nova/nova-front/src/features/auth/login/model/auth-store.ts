"use client";

import { create } from "zustand";
import type { LoggedInUser } from "@/entities/user/model/types";

const SESSION_KEY = "nova-auth-user";
export const AUTH_EXPIRED_EVENT = "nova-auth-expired";

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
      Array.isArray((user as LoggedInUser).roleCodes) &&
      typeof (user as LoggedInUser).accessToken === "string" &&
      typeof (user as LoggedInUser).expiresAt === "string" &&
      new Date((user as LoggedInUser).expiresAt).getTime() > Date.now()
    ) {
      return user as LoggedInUser;
    }
  } catch {
    // 손상된 탭 세션은 로그아웃 상태로 정리한다.
  }

  window.sessionStorage.removeItem(SESSION_KEY);
  return null;
}

/** Axios 요청 경계에서 만료되지 않은 access token만 Authorization 헤더로 전송한다. */
export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return parseLoggedInUser(window.sessionStorage.getItem(SESSION_KEY))?.accessToken ?? null;
}

/** 인증 실패 응답을 받으면 탭 세션을 정리하고 AuthGate에 상태 변경을 알린다. */
export function expireStoredAuth() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

/**
 * TanStack Query의 서버 요청 결과를 화면 전역 로그인 상태로 연결한다.
 * access token과 사용자 정보를 탭 세션에 보관하고, 새로고침 시 만료 여부를 확인한다.
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

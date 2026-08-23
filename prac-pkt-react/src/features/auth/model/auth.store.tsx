import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { login as requestLogin, logout as requestLogout } from "../api/auth.api";
import { configureApiSession } from "../../../shared/api/http";
import type { AuthUser } from "./auth.types";

const ACCESS_TOKEN_KEY = "pkt-practice.accessToken";
const REFRESH_TOKEN_KEY = "pkt-practice.refreshToken";
const USER_KEY = "pkt-practice.user";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** 401로 세션이 끊겨 로그인 화면으로 돌아온 경우를 구분한다. */
  isExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser(): AuthUser | null {
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return null;
  try { return JSON.parse(saved) as AuthUser; } catch { return null; }
}

function clearStoredSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(readUser);
  const [isExpired, setIsExpired] = useState(false);

  /**
   * API가 401을 받으면 저장된 세션을 지운다.
   * isAuthenticated가 false로 바뀌므로 RequireAuth가 로그인 화면으로 되돌린다.
   */
  useEffect(() => {
    configureApiSession({
      getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
      onUnauthorized: () => {
        if (!localStorage.getItem(ACCESS_TOKEN_KEY)) return;
        clearStoredSession();
        setAccessToken(null);
        setUser(null);
        setIsExpired(true);
      },
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken && user),
    isExpired,
    async login(email, password) {
      const data = await requestLogin(email, password);
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAccessToken(data.accessToken);
      setUser(data.user);
      setIsExpired(false);
    },
    async logout() {
      if (accessToken) await requestLogout(accessToken).catch(() => undefined);
      clearStoredSession();
      setAccessToken(null);
      setUser(null);
      setIsExpired(false);
    },
  }), [accessToken, user, isExpired]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

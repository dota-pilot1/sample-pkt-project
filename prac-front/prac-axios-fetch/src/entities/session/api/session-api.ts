import { ApiError } from "@/shared/api/api-error";
import type { ApiErrorResponse } from "@/entities/equipment/model/equipment";
import type {
  LoginInput,
  RegisterInput,
  SessionResponse,
} from "../model/session";

/** 순수 fetch로 로그인하고 서버가 설정한 HttpOnly 세션 쿠키를 사용한다. */
export async function login(input: LoginInput): Promise<SessionResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as SessionResponse & Partial<ApiErrorResponse>;

  if (!response.ok) {
    throw new ApiError(
      body.message ?? "로그인하지 못했습니다.",
      response.status,
      body.code ?? "LOGIN_FAILED",
    );
  }
  return body;
}

/** 순수 fetch로 계정을 만들고 응답에서 발급된 HttpOnly 세션을 즉시 사용한다. */
export async function register(input: RegisterInput): Promise<SessionResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as SessionResponse & Partial<ApiErrorResponse>;

  if (!response.ok) {
    throw new ApiError(
      body.message ?? "회원가입하지 못했습니다.",
      response.status,
      body.code ?? "REGISTER_FAILED",
    );
  }
  return body;
}

/** 새로고침 뒤에도 서버 세션을 기준으로 현재 사용자를 복원한다. */
export async function fetchCurrentSession(): Promise<SessionResponse> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  const body = (await response.json()) as SessionResponse & Partial<ApiErrorResponse>;

  // 로그인 전 401은 화면의 정상적인 비로그인 상태이므로 예외가 아닌 null 사용자로 변환한다.
  if (response.status === 401) return { user: null };
  if (!response.ok) {
    throw new ApiError(
      body.message ?? "세션을 확인하지 못했습니다.",
      response.status,
      body.code ?? "SESSION_FAILED",
    );
  }
  return body;
}

/** 서버 세션과 브라우저 쿠키를 함께 제거한다. */
export async function logout() {
  const response = await fetch("/api/auth/logout", { method: "DELETE" });
  const body = (await response.json()) as { message?: string } & Partial<ApiErrorResponse>;
  if (!response.ok) {
    throw new ApiError(
      body.message ?? "로그아웃하지 못했습니다.",
      response.status,
      body.code ?? "LOGOUT_FAILED",
    );
  }
  return body;
}

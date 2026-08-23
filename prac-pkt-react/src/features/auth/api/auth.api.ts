import type { LoginResponse } from "../model/auth.types";
import { apiUrl } from "../../../shared/api/http";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(apiUrl("auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const raw = await response.text();
  let data: (LoginResponse & { message?: string }) | null = null;
  try { data = JSON.parse(raw) as LoginResponse & { message?: string }; } catch { /* 서버의 평문 오류도 아래에서 처리한다. */ }
  if (!response.ok) throw new Error((data?.message ?? raw) || "로그인에 실패했습니다.");
  if (!data) throw new Error("로그인 응답을 읽지 못했습니다.");
  return data;
}

export async function logout(accessToken: string): Promise<void> {
  await fetch(apiUrl("auth/logout"), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

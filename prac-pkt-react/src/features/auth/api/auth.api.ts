import type { LoginResponse, SignupRequest, SignupResponse } from "../model/auth.types";
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

async function readError(response: Response): Promise<string> {
  const raw = await response.text();
  try {
    const data = JSON.parse(raw) as { message?: string; fieldErrors?: Record<string, string> };
    return (data.fieldErrors && Object.values(data.fieldErrors)[0]) ?? data.message ?? raw;
  } catch { return raw; }
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(apiUrl("auth/signup"), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error((await readError(response)) || "회원가입에 실패했습니다.");
  return response.json() as Promise<SignupResponse>;
}

export async function checkEmail(email: string): Promise<boolean> {
  const response = await fetch(apiUrl(`auth/check-email?email=${encodeURIComponent(email)}`));
  if (!response.ok) throw new Error((await readError(response)) || "이메일 중복확인에 실패했습니다.");
  return (await response.json() as { available: boolean }).available;
}

export async function logout(accessToken: string): Promise<void> {
  await fetch(apiUrl("auth/logout"), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

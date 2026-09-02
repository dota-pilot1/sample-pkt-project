import { NextResponse } from "next/server";
import { authenticateUser } from "@/server/auth/user-repository";
import { attachSessionCookie, createSession } from "@/server/auth/session";
import { apiError } from "@/server/http/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return apiError(400, "INVALID_LOGIN_INPUT", "아이디와 비밀번호를 입력해 주세요.");
  }

  const { username, password } = body as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return apiError(400, "INVALID_LOGIN_INPUT", "아이디와 비밀번호를 입력해 주세요.");
  }

  const user = authenticateUser(username, password);
  if (!user) return apiError(401, "INVALID_CREDENTIALS", "로그인 정보를 확인해 주세요.");

  const session = createSession(user.id);
  const response = NextResponse.json({ user });
  return attachSessionCookie(response, session);
}

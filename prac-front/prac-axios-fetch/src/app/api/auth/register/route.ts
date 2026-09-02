import { NextResponse } from "next/server";
import { validateRegistration } from "@/server/auth/register-validation";
import { createUser } from "@/server/auth/user-repository";
import { attachSessionCookie, createSession } from "@/server/auth/session";
import { apiError } from "@/server/http/api-response";

export const runtime = "nodejs";

/** 새 계정을 만든 뒤 별도 로그인 요청 없이 바로 사용할 세션까지 발급한다. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const validation = validateRegistration(body);
  if (!validation.ok) return apiError(400, validation.code, validation.message);

  const user = createUser(validation.value);
  if (!user) return apiError(409, "USERNAME_ALREADY_EXISTS", "이미 사용 중인 아이디입니다.");

  const session = createSession(user.id);
  const response = NextResponse.json({ user }, { status: 201 });
  return attachSessionCookie(response, session);
}

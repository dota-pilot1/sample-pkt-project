import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { apiError } from "@/server/http/api-response";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "UNAUTHENTICATED", "로그인이 필요합니다.");
  return NextResponse.json({ user });
}


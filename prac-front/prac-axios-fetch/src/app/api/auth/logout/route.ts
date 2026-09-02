import { NextResponse } from "next/server";
import {
  deleteCurrentSession,
  sessionCookieName,
} from "@/server/auth/session";

export const runtime = "nodejs";

export async function DELETE() {
  await deleteCurrentSession();
  const response = NextResponse.json({ message: "로그아웃했습니다." });
  response.cookies.set(sessionCookieName, "", { expires: new Date(0), path: "/" });
  return response;
}


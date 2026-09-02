import "server-only";

import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { db } from "@/server/db/sqlite";
import { sessionsTable, usersTable } from "@/server/db/schema";
import type { SessionUser } from "@/entities/session/model/session";

export const sessionCookieName = "axios_fetch_session";
const sessionDurationMs = 8 * 60 * 60 * 1000;

/** 사용자 ID에 연결된 불투명 세션 토큰을 SQLite에 생성한다. */
export function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + sessionDurationMs);

  db.insert(sessionsTable)
    .values({
      token,
      userId,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })
    .run();

  return { token, expiresAt };
}

/** 로그인과 회원가입이 동일한 보안 옵션으로 HttpOnly 세션 쿠키를 발급하게 한다. */
export function attachSessionCookie(
  response: NextResponse,
  session: ReturnType<typeof createSession>,
) {
  response.cookies.set(sessionCookieName, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
    path: "/",
  });
  return response;
}

/** HttpOnly 쿠키 토큰을 DB 세션과 대조해 현재 인증 사용자를 반환한다. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  const current = db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.token, token),
        gt(sessionsTable.expiresAt, new Date().toISOString()),
        eq(usersTable.active, true),
      ),
    )
    .get();

  return current ?? null;
}

/** 현재 쿠키의 서버 세션을 제거해 로그아웃을 확정한다. */
export async function deleteCurrentSession() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (token) db.delete(sessionsTable).where(eq(sessionsTable.token, token)).run();
}

import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/server/db/sqlite";
import { usersTable } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "./password";

interface CreateUserInput {
  username: string;
  displayName: string;
  password: string;
}

/** 활성 계정과 비밀번호 해시를 대조하고 로그인 가능한 사용자만 반환한다. */
export function authenticateUser(username: string, password: string) {
  const user = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username.trim()))
    .get();

  if (!user?.active || !verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, username: user.username, displayName: user.displayName };
}

/** 정규화된 아이디의 중복을 확인하고 비밀번호 원문 대신 scrypt 해시만 저장한다. */
export function createUser(input: CreateUserInput) {
  const username = input.username.trim().toLowerCase();
  const existing = db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .get();

  if (existing) return null;

  try {
    return db
      .insert(usersTable)
      .values({
        username,
        displayName: input.displayName.trim(),
        passwordHash: hashPassword(input.password),
      })
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
      })
      .get();
  } catch (error) {
    // 사전 조회와 INSERT 사이에 같은 아이디가 만들어진 경우에도 409로 처리할 수 있게 중복을 null로 통일한다.
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) return null;
    throw error;
  }
}

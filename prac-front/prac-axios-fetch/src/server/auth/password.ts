import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** 비밀번호를 무작위 salt와 함께 저장 가능한 문자열로 변환한다. */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** 저장된 salt로 입력 비밀번호를 다시 계산하고 timing-safe 방식으로 비교한다. */
export function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}


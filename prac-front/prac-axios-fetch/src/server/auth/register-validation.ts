import type { RegisterInput } from "@/entities/session/model/session";

type ValidationResult =
  | { ok: true; value: RegisterInput }
  | { ok: false; code: string; message: string };

/** 회원가입 요청의 타입·길이·아이디 형식·비밀번호 강도를 DB 접근 전에 검증한다. */
export function validateRegistration(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, code: "INVALID_REGISTER_INPUT", message: "가입 정보를 입력해 주세요." };
  }

  const { username, displayName, password } = input as Record<string, unknown>;
  if (typeof username !== "string" || typeof displayName !== "string" || typeof password !== "string") {
    return { ok: false, code: "INVALID_REGISTER_INPUT", message: "가입 정보를 확인해 주세요." };
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedDisplayName = displayName.trim();

  if (!/^[a-z0-9][a-z0-9_-]{3,19}$/.test(normalizedUsername)) {
    return { ok: false, code: "INVALID_USERNAME", message: "아이디는 영문 소문자·숫자·_·- 조합의 4~20자로 입력해 주세요." };
  }
  if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > 30) {
    return { ok: false, code: "INVALID_DISPLAY_NAME", message: "표시 이름은 2~30자로 입력해 주세요." };
  }
  if (password.length < 8 || password.length > 64 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { ok: false, code: "WEAK_PASSWORD", message: "비밀번호는 영문과 숫자를 포함한 8~64자로 입력해 주세요." };
  }

  return {
    ok: true,
    value: { username: normalizedUsername, displayName: normalizedDisplayName, password },
  };
}

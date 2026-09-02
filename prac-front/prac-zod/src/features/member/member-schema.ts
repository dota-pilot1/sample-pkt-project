import { z } from "zod";

// 중복 확인 API와 수정 API가 같은 닉네임 형식 규칙을 공유한다.
export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "닉네임을 2자 이상 입력하세요.")
  .max(12, "닉네임은 12자 이하로 입력하세요.");

// 클라이언트 폼과 Route Handler가 같은 회원 수정 규칙을 공유한다.
export const memberSchema = z.object({
  name: z.string().trim().min(2, "이름을 2자 이상 입력하세요."),
  nickname: nicknameSchema,
  email: z.email("올바른 이메일을 입력하세요."),
  birthDate: z.iso.date("생년월일을 YYYY-MM-DD 형식으로 입력하세요."),
  department: z.enum(["개발", "기획", "디자인"], "부서를 선택하세요."),
});

export type MemberForm = z.infer<typeof memberSchema>;

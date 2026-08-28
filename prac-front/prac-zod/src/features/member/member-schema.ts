import { z } from "zod";

// 클라이언트 폼과 Route Handler가 같은 회원 수정 규칙을 공유한다.
export const memberSchema = z.object({
  name: z.string().trim().min(2, "이름을 2자 이상 입력하세요."),
  email: z.email("올바른 이메일을 입력하세요."),
  birthDate: z.iso.date("생년월일을 YYYY-MM-DD 형식으로 입력하세요."),
  department: z.enum(["개발", "기획", "디자인"], "부서를 선택하세요."),
});

export type MemberForm = z.infer<typeof memberSchema>;

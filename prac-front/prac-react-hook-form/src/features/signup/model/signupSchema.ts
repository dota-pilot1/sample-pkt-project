import { z } from "zod";

export const signupSchema = z
  .object({
    username: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요.").max(50),
    email: z.string().trim().email("이메일 형식을 확인해 주세요."),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .regex(/[A-Za-z]/, "비밀번호에 영문을 넣어 주세요.")
      .regex(/\d/, "비밀번호에 숫자를 넣어 주세요."),
    passwordConfirm: z.string(),
    agreeToTerms: z.boolean().refine((value) => value, "약관에 동의해 주세요."),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type SignupValues = z.infer<typeof signupSchema>;

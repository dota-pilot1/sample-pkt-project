"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signupSchema = z
  .object({
    username: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요."),
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

type ValidationFormValues = z.infer<typeof signupSchema>;

export default function ValidationSignupForm() {
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ValidationFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      agreeToTerms: false,
    },
  });
  const password = watch("password");
  const passwordChecks = [
    { label: "8자 이상", valid: password.length >= 8 },
    { label: "영문", valid: /[A-Za-z]/.test(password) },
    { label: "숫자", valid: /\d/.test(password) },
  ];

  // 서버 저장 전, Zod가 모든 규칙을 통과한 값만 여기로 보낸다.
  async function onSubmit(values: ValidationFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmittedName(values.username);
  }

  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">MENU 2 · VALIDATION FORM</p>
          <h2>회원가입 검증 폼</h2>
          <p>Zod가 입력값을 검사하고 오류를 알려줍니다.</p>
        </div>
        <span>RHF + Zod</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="field">
          이름
          <input {...register("username")} placeholder="홍길동" autoComplete="name" />
          {errors.username && <small className="field-error">{errors.username.message}</small>}
        </label>

        <label className="field">
          이메일
          <input {...register("email")} type="email" placeholder="user@example.com" autoComplete="email" />
          {errors.email && <small className="field-error">{errors.email.message}</small>}
        </label>

        <label className="field">
          비밀번호
          <div className="password-row">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="8자 이상, 영문·숫자 포함"
              autoComplete="new-password"
            />
            <button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "숨김" : "보기"}
            </button>
          </div>
          {errors.password && <small className="field-error">{errors.password.message}</small>}
          <span className="checks">
            {passwordChecks.map((check) => (
              <span key={check.label} className={`check ${check.valid ? "valid" : ""}`}>
                {check.valid ? "✓" : "○"} {check.label}
              </span>
            ))}
          </span>
        </label>

        <label className="field">
          비밀번호 확인
          <div className="password-row">
            <input
              {...register("passwordConfirm")}
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="비밀번호를 한 번 더 입력"
              autoComplete="new-password"
            />
            <button type="button" className="icon-button" onClick={() => setShowPasswordConfirm((value) => !value)}>
              {showPasswordConfirm ? "숨김" : "보기"}
            </button>
          </div>
          {errors.passwordConfirm && <small className="field-error">{errors.passwordConfirm.message}</small>}
        </label>

        <label className="terms">
          <input {...register("agreeToTerms")} type="checkbox" />
          <span>
            서비스 이용약관에 동의합니다.
            {errors.agreeToTerms && <small className="field-error">{errors.agreeToTerms.message}</small>}
          </span>
        </label>

        <button className="primary" disabled={isSubmitting}>
          {isSubmitting ? "검사 중…" : "검증 통과 확인"}
        </button>

        {submittedName && (
          <p className="success" role="status">
            <strong>검증 성공</strong>
            <br />
            {submittedName}님의 모든 입력값이 규칙을 통과했습니다.
          </p>
        )}
      </form>
    </section>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SignupApiError, signupApi, signupKeys } from "@/src/features/signup/api/signupApi";
import { signupSchema, type SignupValues } from "@/src/features/signup/model/signupSchema";

type EmailCheckState = "idle" | "available" | "taken";

function VisibilityIcon({ visible }: Readonly<{ visible: boolean }>) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16.8 16.8 0 0 1-3.1 3.8M6.1 8.2A16.9 16.9 0 0 0 2.5 12s3.4 6 9.5 6c1.1 0 2.1-.2 3-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export default function SignupSaveForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [emailCheckState, setEmailCheckState] = useState<EmailCheckState>("idle");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: { username: "", email: "", password: "", passwordConfirm: "", agreeToTerms: false },
  });
  const email = watch("email");
  const normalizedEmail = email.trim().toLowerCase();

  const checkEmailMutation = useMutation({ mutationFn: signupApi.checkEmail });
  const signupMutation = useMutation({ mutationFn: signupApi.create });

  // 중복 확인 뒤 이메일을 바꾸면, 이전 확인 결과는 더 이상 사용할 수 없다.
  useEffect(() => {
    if (verifiedEmail && verifiedEmail !== normalizedEmail) {
      setVerifiedEmail(null);
      setEmailCheckState("idle");
    }
  }, [normalizedEmail, verifiedEmail]);

  async function checkEmail() {
    setServerError(null);
    const emailIsValid = await trigger("email");
    if (!emailIsValid) return;

    try {
      const result = await checkEmailMutation.mutateAsync(normalizedEmail);
      if (!result.available) {
        setEmailCheckState("taken");
        setVerifiedEmail(null);
        setError("email", { type: "server", message: "이미 등록된 이메일입니다." });
        return;
      }

      clearErrors("email");
      setEmailCheckState("available");
      setVerifiedEmail(normalizedEmail);
    } catch (error) {
      setEmailCheckState("idle");
      setServerError(error instanceof Error ? error.message : "중복 확인에 실패했습니다.");
    }
  }

  async function onSubmit(values: SignupValues) {
    if (verifiedEmail !== values.email.trim().toLowerCase()) {
      setError("email", { type: "manual", message: "이메일 중복 확인을 먼저 해주세요." });
      return;
    }

    setServerError(null);
    try {
      await signupMutation.mutateAsync(values);
      await queryClient.invalidateQueries({ queryKey: signupKeys.list() });
      reset();
      router.push("/");
    } catch (error) {
      if (error instanceof SignupApiError && error.status === 409) {
        setEmailCheckState("taken");
        setVerifiedEmail(null);
        setError("email", { type: "server", message: error.message });
        return;
      }

      setServerError(error instanceof Error ? error.message : "가입 신청을 저장하지 못했습니다.");
    }
  }

  const saving = isSubmitting || signupMutation.isPending;

  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">MENU 3 · SAVE FORM</p>
          <h2>회원가입 저장 폼</h2>
          <p>중복 확인 후 서버에 저장하고 메인으로 이동합니다.</p>
        </div>
        <span>RHF + Query</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="field">
          이름
          <input {...register("username")} placeholder="홍길동" autoComplete="name" />
          {errors.username ? <small className="field-error">{errors.username.message}</small> : null}
        </label>

        <label className="field">
          이메일
          <div className="email-row">
            <input {...register("email")} type="email" placeholder="user@example.com" autoComplete="email" />
            <button
              type="button"
              className={`secondary email-check-button ${emailCheckState === "available" ? "is-available" : ""}`}
              onClick={checkEmail}
              disabled={checkEmailMutation.isPending}
            >
              {checkEmailMutation.isPending ? "확인 중" : emailCheckState === "available" ? "확인 완료" : "중복 확인"}
            </button>
          </div>
          {errors.email ? <small className="field-error">{errors.email.message}</small> : null}
          {emailCheckState === "available" ? <small className="field-success">사용 가능한 이메일입니다.</small> : null}
        </label>

        <label className="field">
          비밀번호
          <div className="password-row">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="8자 이상, 영문·숫자 포함" autoComplete="new-password" />
            <button
              type="button"
              className="visibility-button"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              onClick={() => setShowPassword((value) => !value)}
            >
              <VisibilityIcon visible={showPassword} />
            </button>
          </div>
          {errors.password ? <small className="field-error">{errors.password.message}</small> : null}
        </label>

        <label className="field">
          비밀번호 확인
          <div className="password-row">
            <input {...register("passwordConfirm")} type={showPasswordConfirm ? "text" : "password"} placeholder="비밀번호를 한 번 더 입력" autoComplete="new-password" />
            <button
              type="button"
              className="visibility-button"
              aria-label={showPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
              title={showPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
              onClick={() => setShowPasswordConfirm((value) => !value)}
            >
              <VisibilityIcon visible={showPasswordConfirm} />
            </button>
          </div>
          {errors.passwordConfirm ? <small className="field-error">{errors.passwordConfirm.message}</small> : null}
        </label>

        <label className="terms">
          <input {...register("agreeToTerms")} type="checkbox" />
          <span>서비스 이용약관에 동의합니다.{errors.agreeToTerms ? <small className="field-error">{errors.agreeToTerms.message}</small> : null}</span>
        </label>

        {serverError ? <p className="server-error" role="alert">{serverError}</p> : null}
        <button className="primary" disabled={saving}>{saving ? "저장 중…" : "회원가입 신청 저장"}</button>
      </form>
    </section>
  );
}

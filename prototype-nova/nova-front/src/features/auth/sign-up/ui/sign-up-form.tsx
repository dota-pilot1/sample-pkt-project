"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, Eye, EyeOff, UserPlus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/api/client";
import { useSignUp } from "../model/use-sign-up";

/** 클라이언트에서 즉시 확인할 회원 가입 입력 계약이다. */
const signUpFormSchema = z
  .object({
    loginId: z
      .string()
      .trim()
      .regex(
        /^[A-Za-z][A-Za-z0-9._-]{3,29}$/,
        "영문으로 시작하는 4~30자의 영문·숫자·._-만 사용할 수 있습니다.",
      ),
    displayName: z
      .string()
      .trim()
      .min(2, "표시명은 2~100자로 입력해 주세요.")
      .max(100, "표시명은 2~100자로 입력해 주세요."),
    password: z
      .string()
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,72}$/,
        "공백 없이 8~72자이며 영문, 숫자, 특수문자를 각각 포함해야 합니다.",
      ),
    passwordConfirm: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

/** Zod 스키마를 기준으로 폼 값 타입을 추론해 입력 계약을 한 곳에서 유지한다. */
type SignUpFormValues = z.infer<typeof signUpFormSchema>;

const fieldClassName = "grid gap-1.5 text-[13px] font-bold text-[var(--ink)]";
const fieldErrorClassName =
  "text-xs font-medium leading-[1.45] text-[var(--accent-deep)]";

export function SignUpForm() {
  const router = useRouter();
  const signUpMutation = useSignUp();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    // Zod 검증 실패를 React Hook Form의 errors 상태로 연결한다.
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      loginId: "",
      displayName: "",
      password: "",
      passwordConfirm: "",
    },
  });
  const [formError, setFormError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const submit = async (values: SignUpFormValues) => {
    setFormError("");
    try {
      await signUpMutation.mutateAsync({
        loginId: values.loginId.trim(),
        displayName: values.displayName.trim(),
        password: values.password,
      });
      setCompleted(true);
    } catch (error) {
      if (error instanceof ApiError) {
        // 서버 검증 오류는 해당 입력 필드에, 공통 오류 메시지는 폼 상단에 표시한다.
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (
            field === "loginId" ||
            field === "displayName" ||
            field === "password"
          ) {
            setError(field, { type: "server", message });
          }
        }
        setFormError(error.message);
        return;
      }
      setFormError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    }
  };

  if (completed) {
    return (
      <section
        className="grid w-full max-w-[480px] justify-items-center rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[0_20px_50px_rgba(49,31,38,0.1)] sm:p-[34px]"
        aria-live="polite"
      >
        <CheckCircle2
          aria-hidden="true"
          size={44}
          className="text-emerald-600"
        />
        <h1 className="mt-4 text-[22px] font-bold tracking-[-0.04em] text-[var(--ink)]">
          회원 가입이 완료되었습니다.
        </h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-[var(--muted)]">
          로그인 후 NOVA BSS 콘솔을 이용할 수 있습니다.
        </p>
        <Button
          type="button"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          로그인하러 가기
        </Button>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[480px] rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_20px_50px_rgba(49,31,38,0.1)] sm:p-[34px]">
      <div className="flex items-center gap-3">
        <span className="grid size-[42px] place-items-center rounded-xl bg-[var(--accent)] text-white">
          <UserPlus aria-hidden="true" size={22} />
        </span>
        <div>
          <p className="mb-0.5 text-[10px] font-extrabold tracking-[0.11em] text-[var(--accent-deep)]">
            NOVA BSS CONSOLE
          </p>
          <h1 className="text-[26px] font-bold tracking-[-0.04em] text-[var(--ink)]">
            회원 가입
          </h1>
        </div>
      </div>
      <p className="mt-5 mb-6 text-sm leading-[1.7] text-[var(--muted)]">
        운영 콘솔을 사용할 계정을 만들어 주세요. 가입된 계정에는 기본 고객
        역할이 부여됩니다.
      </p>
      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="grid gap-[17px]"
      >
        <Label htmlFor="loginId" className={fieldClassName}>
          로그인 ID
          <Input
            id="loginId"
            {...register("loginId")}
            autoComplete="username"
            aria-invalid={Boolean(errors.loginId)}
            aria-describedby={errors.loginId ? "loginId-error" : undefined}
            placeholder="예: nova.user"
          />
          {errors.loginId && (
            <span id="loginId-error" className={fieldErrorClassName}>
              {errors.loginId.message}
            </span>
          )}
        </Label>
        <Label htmlFor="displayName" className={fieldClassName}>
          표시 이름
          <Input
            id="displayName"
            {...register("displayName")}
            autoComplete="name"
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={
              errors.displayName ? "displayName-error" : undefined
            }
            placeholder="예: 노바 사용자"
          />
          {errors.displayName && (
            <span id="displayName-error" className={fieldErrorClassName}>
              {errors.displayName.message}
            </span>
          )}
        </Label>
        <Label htmlFor="password" className={fieldClassName}>
          비밀번호
          <span className="text-[11px] font-medium text-[var(--muted)]">
            영문·숫자·특수문자 포함 8~72자
          </span>
          <span className="relative">
            <Input
              id="password"
              className="pr-12"
              {...register("password")}
              type={passwordVisible ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              className="absolute top-px right-px grid size-[41px] place-items-center rounded-lg text-[var(--muted)]"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {errors.password && (
            <span id="password-error" className={fieldErrorClassName}>
              {errors.password.message}
            </span>
          )}
        </Label>
        <Label htmlFor="passwordConfirm" className={fieldClassName}>
          비밀번호 확인
          <Input
            id="passwordConfirm"
            {...register("passwordConfirm")}
            type={passwordVisible ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.passwordConfirm)}
            aria-describedby={
              errors.passwordConfirm ? "passwordConfirm-error" : undefined
            }
          />
          {errors.passwordConfirm && (
            <span id="passwordConfirm-error" className={fieldErrorClassName}>
              {errors.passwordConfirm.message}
            </span>
          )}
        </Label>
        {formError && (
          <p
            className="-mt-0.5 rounded-lg bg-[var(--accent-soft)] px-3 py-2.5 text-xs font-medium leading-[1.45] text-[var(--accent-deep)]"
            role="alert"
          >
            {formError}
          </p>
        )}
        <Button type="submit" disabled={signUpMutation.isPending}>
          {signUpMutation.isPending ? "가입 처리 중…" : "회원 가입"}
        </Button>
      </form>
      <p className="mt-[22px] text-center text-[13px] text-[var(--muted)]">
        이미 계정이 있으신가요?{" "}
        <Link
          className="font-extrabold text-[var(--accent-deep)]"
          href="/login"
        >
          로그인
        </Link>
      </p>
    </section>
  );
}

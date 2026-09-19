"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/api/client";
import { useAuthStore } from "../model/auth-store";
import { useLogin } from "../model/use-login";

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email("올바른 이메일 주소를 입력해 주세요.")
    .max(254, "이메일은 254자 이하여야 합니다."),
  password: z
    .string()
    .min(1, "비밀번호는 필수입니다.")
    .max(72, "비밀번호는 72자 이하여야 합니다."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const fieldClassName = "grid gap-1.5 text-[13px] font-bold text-[var(--ink)]";
const fieldErrorClassName =
  "text-xs font-medium leading-[1.45] text-[var(--accent-deep)]";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const [formError, setFormError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    // RbacSeedDataInitializer가 만드는 로컬 프로토타입 관리자 계정이다.
    // 배포 환경에서는 테스트 계정을 기본값으로 노출하지 않는다.
    defaultValues: { email: "admin@nova.local", password: "local-seed-only" },
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && user) router.replace("/");
  }, [hydrated, router, user]);

  const submit = async (values: LoginFormValues) => {
    setFormError("");
    try {
      await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });
      router.replace("/");
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field === "email" || field === "password") {
            setError(field, { type: "server", message });
          }
        }
        setFormError(error.message);
        return;
      }
      setFormError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    }
  };

  return (
    <section className="w-full max-w-[440px] rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_20px_50px_rgba(49,31,38,0.1)] sm:p-[34px]">
      <div className="flex items-center gap-3">
        <span className="grid size-[42px] place-items-center rounded-xl bg-[var(--accent)] text-white">
          <LogIn aria-hidden="true" size={22} />
        </span>
        <div>
          <p className="mb-0.5 text-[10px] font-extrabold tracking-[0.11em] text-[var(--accent-deep)]">
            NOVA BSS CONSOLE
          </p>
          <h1 className="text-[26px] font-bold tracking-[-0.04em] text-[var(--ink)]">
            로그인
          </h1>
        </div>
      </div>
      <p className="mt-5 mb-6 text-sm leading-[1.7] text-[var(--muted)]">
        운영 콘솔을 이용하려면 계정으로 로그인해 주세요.
      </p>
      <p className="-mt-3 mb-6 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-xs leading-[1.5] text-[var(--accent-deep)]">
        로컬 샘플 데이터 사용 시 관리자 테스트 계정이 미리 입력됩니다.
      </p>
      <form noValidate onSubmit={handleSubmit(submit)} className="grid gap-[17px]">
        <Label htmlFor="email" className={fieldClassName}>
          사내 이메일
          <Input
            id="email"
            {...register("email")}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="예: name@company.com"
          />
          {errors.email && (
            <span id="email-error" className={fieldErrorClassName}>
              {errors.email.message}
            </span>
          )}
        </Label>
        <Label htmlFor="password" className={fieldClassName}>
          비밀번호
          <span className="relative">
            <Input
              id="password"
              className="pr-12"
              {...register("password")}
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
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
        {formError && (
          <p
            className="-mt-0.5 rounded-lg bg-[var(--accent-soft)] px-3 py-2.5 text-xs font-medium leading-[1.45] text-[var(--accent-deep)]"
            role="alert"
          >
            {formError}
          </p>
        )}
        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "로그인 중…" : "로그인"}
        </Button>
      </form>
      <p className="mt-[22px] text-center text-[13px] text-[var(--muted)]">
        아직 계정이 없으신가요?{" "}
        <Link className="font-extrabold text-[var(--accent-deep)]" href="/signup">
          회원 가입
        </Link>
      </p>
    </section>
  );
}

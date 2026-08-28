import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle2, Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { checkEmail, signup } from "../api/auth.api";

const signupSchema = z.object({
  username: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요.").max(50, "이름은 50자 이하로 입력해 주세요."),
  email: z.string().trim().email("올바른 이메일을 입력해 주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").regex(/[A-Za-z]/, "영문을 포함해 주세요.").regex(/\d/, "숫자를 포함해 주세요."),
  passwordConfirm: z.string(),
  agreeToTerms: z.boolean().refine((value) => value, "서비스 이용약관에 동의해 주세요."),
}).refine((value) => value.password === value.passwordConfirm, {
  path: ["passwordConfirm"], message: "비밀번호가 일치하지 않습니다.",
});

type SignupFormValues = z.infer<typeof signupSchema>;
type EmailStatus = "idle" | "checking" | "available" | "taken";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema), mode: "onBlur",
    defaultValues: { username: "", email: "", password: "", passwordConfirm: "", agreeToTerms: false },
  });
  const password = watch("password");
  const email = watch("email");
  const passwordChecks = [
    { label: "8자 이상", valid: password.length >= 8 },
    { label: "영문 포함", valid: /[A-Za-z]/.test(password) },
    { label: "숫자 포함", valid: /\d/.test(password) },
  ];

  async function handleEmailCheck() {
    const result = signupSchema.shape.email.safeParse(email.trim());
    if (!result.success) { setEmailStatus("idle"); return; }
    setEmailStatus("checking"); clearErrors("email");
    try {
      const available = await checkEmail(email.trim());
      setEmailStatus(available ? "available" : "taken");
      if (!available) setError("email", { type: "server", message: "이미 사용 중인 이메일입니다." });
    } catch (error) {
      setEmailStatus("idle");
      setError("email", { type: "server", message: error instanceof Error ? error.message : "이메일 확인에 실패했습니다." });
    }
  }

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);
    if (emailStatus !== "available") {
      setError("email", { type: "validate", message: "이메일 중복확인을 완료해 주세요." }); return;
    }
    try {
      await signup({ email: values.email.trim(), password: values.password, username: values.username.trim() });
      navigate("/login", { replace: true, state: { signupMessage: "회원가입이 완료되었습니다. 로그인해 주세요.", email: values.email } });
    } catch (error) { setServerError(error instanceof Error ? error.message : "회원가입에 실패했습니다."); }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-100 p-5"><section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
    <div className="mb-7 flex items-start justify-between gap-4"><div><div className="mb-4 grid size-12 place-items-center rounded-2xl bg-sky-600 text-xl font-black text-white">P</div><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">PKT React Practice</p><h1 className="mt-2 text-2xl font-black">회원가입</h1><p className="mt-2 text-sm text-slate-500">MES 실습 계정을 만들고 폼 상태를 확인해 보세요.</p></div><Link to="/login" className="text-sm font-bold text-slate-500 hover:text-sky-700">로그인</Link></div>
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field label="이름" error={errors.username?.message}><input {...register("username")} autoComplete="name" placeholder="홍길동" className={inputClass(Boolean(errors.username))} /></Field>
      <Field label="이메일" error={errors.email?.message} hint={emailStatus === "available" ? "사용 가능한 이메일입니다." : undefined}><div className="flex gap-2"><input {...register("email", { onBlur: handleEmailCheck })} type="email" autoComplete="email" placeholder="user@example.com" className={inputClass(Boolean(errors.email))} /><button type="button" onClick={handleEmailCheck} disabled={emailStatus === "checking"} className="shrink-0 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">{emailStatus === "checking" ? <LoaderCircle className="size-4 animate-spin" /> : "중복확인"}</button></div></Field>
      <Field label="비밀번호" error={errors.password?.message}><PasswordInput registration={register("password")} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} autoComplete="new-password" label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"} /></Field>
      <div className="-mt-2 flex flex-wrap gap-2">{passwordChecks.map((item) => <span key={item.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${item.valid ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{item.valid ? <Check className="size-3" /> : <X className="size-3" />}{item.label}</span>)}</div>
      <Field label="비밀번호 확인" error={errors.passwordConfirm?.message}><PasswordInput registration={register("passwordConfirm")} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} autoComplete="new-password" label={showConfirm ? "비밀번호 숨기기" : "비밀번호 표시"} /></Field>
      <label className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${errors.agreeToTerms ? "border-red-300 bg-red-50" : "border-slate-200"}`}><input {...register("agreeToTerms")} type="checkbox" className="mt-0.5 size-4 accent-sky-600" /><span><strong>서비스 이용약관에 동의합니다.</strong><small className="mt-1 block text-slate-500">학습용 서비스의 기본 약관에 동의해야 가입할 수 있습니다.</small>{errors.agreeToTerms && <small className="mt-1 block font-bold text-red-600">{errors.agreeToTerms.message}</small>}</span></label>
      {serverError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-3 text-sm font-semibold text-red-700">{serverError}</p>}
      <button disabled={isSubmitting || emailStatus === "checking"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <><LoaderCircle className="size-4 animate-spin" />가입 처리 중…</> : <><CheckCircle2 className="size-4" />회원가입</>}</button>
    </form>
  </section></main>;
}

function inputClass(hasError: boolean) { return `min-w-0 w-full rounded-xl border px-3 py-3 outline-none focus:border-sky-500 ${hasError ? "border-red-300 bg-red-50" : "border-slate-200"}`; }
function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) { return <label className="block text-sm font-bold text-slate-700"><span>{label}</span>{children}{hint && <small className="mt-1 block text-emerald-600">{hint}</small>}{error && <small className="mt-1 block font-bold text-red-600">{error}</small>}</label>; }
function PasswordInput({ registration, visible, onToggle, autoComplete, label }: { registration: UseFormRegisterReturn; visible: boolean; onToggle: () => void; autoComplete: string; label: string }) { return <div className="relative mt-2"><input {...registration} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder="8자 이상, 영문·숫자 포함" className={inputClass(false) + " pr-11"} /><button type="button" onClick={onToggle} aria-label={label} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>; }

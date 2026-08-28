"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signupSchema = z.object({
  username: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요."),
  email: z.string().trim().email("올바른 이메일을 입력해 주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").regex(/[A-Za-z]/, "영문을 포함해 주세요.").regex(/\d/, "숫자를 포함해 주세요."),
  passwordConfirm: z.string(),
  agreeToTerms: z.boolean().refine((value) => value, "약관에 동의해 주세요."),
}).refine((value) => value.password === value.passwordConfirm, { path: ["passwordConfirm"], message: "비밀번호가 일치하지 않습니다." });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), mode: "onBlur", defaultValues: { username: "", email: "", password: "", passwordConfirm: "", agreeToTerms: false } });
  const password = watch("password");
  const email = watch("email");
  const passwordRules = [{ label: "8자 이상", valid: password.length >= 8 }, { label: "영문", valid: /[A-Za-z]/.test(password) }, { label: "숫자", valid: /\d/.test(password) }];

  async function checkEmail() {
    const parsed = signupSchema.shape.email.safeParse(email.trim());
    if (!parsed.success) { setEmailChecked(false); setEmailMessage(null); return; }
    const response = await fetch(`/api/forms?email=${encodeURIComponent(email.trim())}`);
    const data = await response.json() as { available?: boolean; message?: string };
    if (!response.ok) { setEmailChecked(false); setError("email", { message: data.message ?? "이메일을 확인하지 못했습니다." }); return; }
    setEmailChecked(Boolean(data.available));
    setEmailMessage(data.available ? "사용할 수 있는 이메일입니다." : "이미 등록된 이메일입니다.");
    if (data.available) clearErrors("email"); else setError("email", { message: "이미 등록된 이메일입니다." });
  }

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    if (!emailChecked) { setError("email", { message: "이메일 중복확인을 먼저 해주세요." }); return; }
    const response = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: values.email.trim(), username: values.username.trim(), password: values.password }) });
    if (!response.ok) { const data = await response.json() as { message?: string }; setServerError(data.message ?? "저장하지 못했습니다."); return; }
    window.location.reload();
  }

  return <section className="card"><div className="card-heading"><div><p className="eyebrow">STEP 1</p><h2>회원가입 정보</h2><p>먼저 폼의 기본 흐름을 익힙니다.</p></div><span>RHF + Zod</span></div><form onSubmit={handleSubmit(onSubmit)} noValidate>
    <label className="field">이름<input {...register("username")} placeholder="홍길동" autoComplete="name" />{errors.username && <small className="field-error">{errors.username.message}</small>}</label>
    <label className="field">이메일<div className="email-row"><input {...register("email", { onChange: () => { setEmailChecked(false); setEmailMessage(null); } })} type="email" placeholder="user@example.com" autoComplete="email" /><button type="button" className="secondary" onClick={checkEmail}>중복확인</button></div>{emailMessage && <small className={`field-error ${emailChecked ? "available" : ""}`}>{emailMessage}</small>}{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
    <label className="field">비밀번호<div className="password-row"><input {...register("password")} type={showPassword ? "text" : "password"} placeholder="8자 이상, 영문·숫자 포함" autoComplete="new-password" /><button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)} aria-label="비밀번호 표시">{showPassword ? "숨김" : "보기"}</button></div>{errors.password && <small className="field-error">{errors.password.message}</small>}<span className="checks">{passwordRules.map((rule) => <span key={rule.label} className={`check ${rule.valid ? "valid" : ""}`}>{rule.valid ? "✓" : "○"} {rule.label}</span>)}</span></label>
    <label className="field">비밀번호 확인<div className="password-row"><input {...register("passwordConfirm")} type={showConfirm ? "text" : "password"} placeholder="비밀번호를 한 번 더 입력" autoComplete="new-password" /><button type="button" className="icon-button" onClick={() => setShowConfirm((value) => !value)} aria-label="비밀번호 확인 표시">{showConfirm ? "숨김" : "보기"}</button></div>{errors.passwordConfirm && <small className="field-error">{errors.passwordConfirm.message}</small>}</label>
    <label className="terms"><input {...register("agreeToTerms")} type="checkbox" /><span>서비스 이용약관에 동의합니다.{errors.agreeToTerms && <small className="field-error">{errors.agreeToTerms.message}</small>}</span></label>
    {serverError && <p className="server-error" role="alert">{serverError}</p>}
    <button className="primary" disabled={isSubmitting}>{isSubmitting ? "저장 중…" : "회원가입 신청 저장"}</button>
  </form></section>;
}

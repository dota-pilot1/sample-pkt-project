import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../model/auth.store";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isExpired } = useAuth();
  const [email, setEmail] = useState("terecal@daum.net");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try { await login(email, password); navigate("/", { replace: true }); }
    catch (loginError) { setError(loginError instanceof Error ? loginError.message : "로그인에 실패했습니다."); }
    finally { setIsSubmitting(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-100 p-5">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8"><div className="mb-4 grid size-12 place-items-center rounded-2xl bg-sky-600 text-xl font-black text-white">P</div><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">PKT React Practice</p><h1 className="mt-2 text-2xl font-black">로그인</h1><p className="mt-2 text-sm text-slate-500">MES 실습 화면에 접속하려면 로그인하세요.</p></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">이메일<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-sky-500" /></label>
        <label className="block text-sm font-bold text-slate-700">비밀번호<div className="relative mt-2"><input required type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 pr-11 outline-none focus:border-sky-500" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
        {!error && isExpired && <p role="status" className="rounded-xl bg-amber-50 px-3 py-3 text-sm font-semibold text-amber-800">세션이 만료되어 로그아웃되었습니다. 다시 로그인해 주세요.</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={isSubmitting} className="w-full rounded-xl bg-sky-600 px-4 py-3 font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "로그인 중…" : "로그인"}</button>
      </form>
    </section>
  </main>;
}

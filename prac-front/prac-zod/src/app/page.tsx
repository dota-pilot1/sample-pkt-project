"use client";

import { useState } from "react";
import { z } from "zod";

const signupSchema = z.object({
  email: z.email("올바른 이메일을 입력하세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  passwordConfirm: z.string(),
  age: z.coerce.number().int("나이는 정수로 입력하세요.").min(14, "14세 이상만 가입할 수 있습니다."),
}).refine((value) => value.password === value.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "비밀번호가 일치하지 않습니다.",
});

type FormState = { email: string; password: string; passwordConfirm: string; age: string };
const initialForm: FormState = { email: "", password: "", passwordConfirm: "", age: "" };

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<string[]>([]);
  const [parsed, setParsed] = useState<Record<string, unknown> | null>(null);

  function validate() {
    const outcome = signupSchema.safeParse(form);
    if (outcome.success) {
      setResult(["검증 성공", `타입 변환된 age: ${outcome.data.age}`, `email: ${outcome.data.email}`]);
      setParsed(outcome.data);
    } else {
      setResult(outcome.error.issues.map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`));
      setParsed(null);
    }
  }

  return <main className="shell">
    <header className="hero"><p className="eyebrow">FRONTEND PRACTICE · 02</p><h1>Zod Practice Lab</h1><p>스키마를 만들고, 런타임에서 안전하게 데이터를 검증합니다.</p></header>
    <section className="grid">
      <article className="card"><div className="card-title"><span>01</span><div><h2>핵심 개념</h2><p>코드로 직접 실행해 보는 순서</p></div></div><ol className="topics"><li><b>schema</b><span>데이터 모양과 규칙 선언</span></li><li><b>safeParse</b><span>성공·실패를 값으로 분기</span></li><li><b>refine</b><span>여러 필드의 관계 검증</span></li><li><b>coerce</b><span>문자열 입력을 숫자로 변환</span></li><li><b>issues</b><span>필드별 오류 경로와 메시지</span></li></ol></article>
      <article className="card"><div className="card-title"><span>02</span><div><h2>회원가입 스키마</h2><p>입력값은 모두 처음에는 문자열입니다.</p></div></div><div className="form">
        {([['email','이메일','email'],['password','비밀번호','password'],['passwordConfirm','비밀번호 확인','password'],['age','나이','text']] as const).map(([name, label, type]) => <label key={name}>{label}<input type={type} value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} placeholder={name === 'age' ? '예: 20' : undefined} /></label>)}
        <button type="button" onClick={validate}>safeParse 실행</button>
      </div></article>
      <article className="card result-card"><div className="card-title"><span>03</span><div><h2>검증 결과</h2><p>성공 데이터와 issues를 비교합니다.</p></div></div>{result.length === 0 ? <p className="empty">값을 입력하고 검증을 실행하세요.</p> : <ul className={parsed ? "success" : "errors"}>{result.map((item) => <li key={item}>{item}</li>)}</ul>}{parsed && <pre>{JSON.stringify(parsed, null, 2)}</pre>}</article>
    </section>
    <footer><span>다음 단계</span> API 응답 검증 → transform / preprocess → React Hook Form resolver</footer>
  </main>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

// 학습 포인트 1: 스키마는 런타임에 들어오는 값의 모양과 규칙을 선언한다.
const signupSchema = z
  .object({
    email: z.email("올바른 이메일을 입력하세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    passwordConfirm: z.string(),
    // HTML input 값은 문자열이므로 coerce로 검증 전에 숫자로 변환한다.
    age: z.coerce
      .number()
      .int("나이는 정수로 입력하세요.")
      .min(14, "14세 이상만 가입할 수 있습니다."),
  })
  // refine은 password와 passwordConfirm처럼 여러 필드의 관계를 검증한다.
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

// 폼 상태는 브라우저 input의 원시 문자열을 그대로 보관한다.
type FormState = {
  email: string;
  password: string;
  passwordConfirm: string;
  age: string;
};
const initialForm: FormState = {
  email: "",
  password: "",
  passwordConfirm: "",
  age: "",
};

function EyeIcon({ closed = false }: { closed?: boolean }) {
  // 비밀번호 표시 상태에 따라 보기 아이콘과 숨김 아이콘을 바꾼다.
  return closed ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 8.7 4 10 8a12.8 12.8 0 0 1-3.1 5.1M6.2 6.2C3.9 7.7 2.6 10.1 2 12c1.3 4 4.8 8 10 8 1.3 0 2.5-.2 3.5-.7" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function HomePage() {
  // React Hook Form 없이 useState만으로 입력·검증 흐름을 직접 관찰한다.
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<string[]>([]);
  const [parsed, setParsed] = useState<Record<string, unknown> | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    passwordConfirm: false,
  });

  function validate() {
    // 학습 포인트 2: safeParse는 예외 대신 success로 성공·실패를 분기한다.
    const outcome = signupSchema.safeParse(form);
    if (outcome.success) {
      // 성공 결과에는 coerce로 변환된 타입 안전한 데이터가 들어 있다.
      setResult([
        "검증 성공",
        `타입 변환된 age: ${outcome.data.age}`,
        `email: ${outcome.data.email}`,
      ]);
      setParsed(outcome.data);
    } else {
      // 실패 결과의 issues에서 필드 경로와 사용자 메시지를 꺼낸다.
      setResult(
        outcome.error.issues.map(
          (issue) => `${issue.path.join(".") || "form"}: ${issue.message}`,
        ),
      );
      setParsed(null);
    }
  }

  return (
    <main className="shell">
      {/* 화면 구조: 개념 설명 → 입력 폼 → 검증 결과 순서로 학습한다. */}
      <header className="hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 1</p>
        <h1>기본 스키마</h1>
        <p>Zod 스키마를 만들고 입력 데이터의 모양을 안전하게 확인합니다.</p>
      </header>
      <section className="grid">
        <article className="card">
          <div className="card-title">
            <span>01</span>
            <div>
              <h2>핵심 개념</h2>
              <p>코드로 직접 실행해 보는 순서</p>
            </div>
          </div>
          <ol className="topics">
            {/* 왼쪽 목록은 실행할 Zod 핵심 개념을 한눈에 보여준다. */}
            <li>
              <b>schema</b>
              <span>데이터 모양과 규칙 선언</span>
            </li>
            <li>
              <b>safeParse</b>
              <span>성공·실패를 값으로 분기</span>
            </li>
            <li>
              <b>refine</b>
              <span>여러 필드의 관계 검증</span>
            </li>
            <li>
              <b>coerce</b>
              <span>문자열 입력을 숫자로 변환</span>
            </li>
            <li>
              <b>issues</b>
              <span>필드별 오류 경로와 메시지</span>
            </li>
          </ol>
        </article>
        <article className="card">
          <div className="card-title">
            <span>02</span>
            <div>
              <h2>회원가입 스키마</h2>
              <p>입력값은 모두 처음에는 문자열입니다.</p>
            </div>
          </div>
          <div className="form">
            {/* 입력 이벤트를 직접 상태에 반영해 폼 라이브러리의 역할을 관찰한다. */}
            {(
              [
                ["email", "이메일", "email"],
                ["age", "나이", "text"],
              ] as const
            ).map(([name, label, type]) => (
              <label key={name}>
                {label}
                <input
                  type={type}
                  value={form[name]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                  placeholder={name === "age" ? "예: 20" : undefined}
                />
              </label>
            ))}
            {(
              [
                ["password", "비밀번호"],
                ["passwordConfirm", "비밀번호 확인"],
              ] as const
            ).map(([name, label]) => (
              <label key={name}>
                {label}
                <span className="password-input">
                  <input
                    type={visiblePasswords[name] ? "text" : "password"}
                    value={form[name]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={
                      visiblePasswords[name]
                        ? `${label} 숨기기`
                        : `${label} 보기`
                    }
                    onClick={() =>
                      setVisiblePasswords((current) => ({
                        ...current,
                        [name]: !current[name],
                      }))
                    }
                  >
                    <EyeIcon closed={!visiblePasswords[name]} />
                  </button>
                </span>
              </label>
            ))}
            {/* 버튼을 누른 시점에만 safeParse를 실행한다. */}
            <button type="button" onClick={validate}>
              safeParse 실행
            </button>
          </div>
        </article>
        <article className="card result-card">
          <div className="card-title">
            <span>03</span>
            <div>
              <h2>검증 결과</h2>
              <p>성공 데이터와 issues를 비교합니다.</p>
            </div>
          </div>
          {result.length === 0 ? (
            <p className="empty">값을 입력하고 검증을 실행하세요.</p>
          ) : (
            <ul className={parsed ? "success" : "errors"}>
              {result.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {parsed && <pre>{JSON.stringify(parsed, null, 2)}</pre>}
        </article>
      </section>
      <nav className="topic-nav" aria-label="Level 1 학습 주제">
        {/* 레벨 1을 schema·safeParse·object 주제 페이지로 나누어 복습한다. */}
        <span>Level 1 학습 주제</span>
        <Link href="/level-1/schema">기본 스키마</Link>
        <Link href="/level-1/safe-parse">safeParse와 issues</Link>
        <Link href="/level-1/object">객체 스키마와 타입</Link>
      </nav>
      <footer>
        <span>다음 단계</span> API 응답 검증 → transform / preprocess → React
        Hook Form resolver
      </footer>
    </main>
  );
}

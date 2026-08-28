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
    // 빈 값·숫자 형식·정수·최소 나이를 순서대로 확인한 뒤 number로 변환한다.
    age: z
      .string()
      .trim()
      .min(1, "나이를 입력하세요.")
      .refine((value) => Number.isFinite(Number(value)), {
        message: "나이는 숫자로 입력하세요.",
      })
      .transform(Number)
      .pipe(
        z
          .number()
          .int("나이는 정수로 입력하세요.")
          .min(14, "14세 이상만 가입할 수 있습니다."),
      ),
    // 중첩 객체를 사용하면 오류 path가 ["address", "zipCode"]처럼 생성된다.
    address: z.object({
      city: z.string().trim().min(1, "도시를 입력하세요."),
      zipCode: z.string().regex(/^\d{5}$/, "우편번호 5자리를 입력하세요."),
    }),
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
  address: {
    city: string;
    zipCode: string;
  };
};

type BasicFieldName = Exclude<keyof FormState, "address">;
type AddressFieldName = keyof FormState["address"];

const initialForm: FormState = {
  email: "",
  password: "",
  passwordConfirm: "",
  age: "",
  address: {
    city: "",
    zipCode: "",
  },
};

// 화면에는 친숙한 한글 라벨을 보여주고 괄호 안에 학습용 path를 남긴다.
const fieldLabels: Record<string, string> = {
  email: "이메일",
  password: "비밀번호",
  passwordConfirm: "비밀번호 확인",
  age: "나이",
  "address.city": "도시",
  "address.zipCode": "우편번호",
  form: "폼 전체",
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
      // 성공 결과에는 transform으로 변환된 타입 안전한 데이터가 들어 있다.
      setResult([
        "검증 성공",
        `타입 변환된 age: ${outcome.data.age}`,
        `email: ${outcome.data.email}`,
      ]);
      setParsed(outcome.data);
    } else {
      // 실패 결과의 issues에서 필드 경로와 사용자 메시지를 꺼낸다.
      setResult(
        outcome.error.issues.map((issue) => {
          const path = issue.path.join(".") || "form";
          const label = fieldLabels[path] ?? path;

          return `${label} (${path}): ${issue.message}`;
        }),
      );
      setParsed(null);
    }
  }

  // 각 입력 필드가 자신의 이름을 명시해 폼 상태를 갱신한다.
  function updateField(name: BasicFieldName, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  // 중첩 객체는 기존 address 값을 유지하면서 변경된 필드만 덮어쓴다.
  function updateAddressField(name: AddressFieldName, value: string) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [name]: value,
      },
    }));
  }

  return (
    <main className="shell">
      {/* 화면 구조: 입력 폼 → 검증 결과 순서로 핵심 흐름만 확인한다. */}
      <header className="hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 1</p>
        <h1>기본 스키마</h1>
        <p>Zod 스키마를 만들고 입력 데이터의 모양을 안전하게 확인합니다.</p>
      </header>
      <section className="practice-grid">
        <article className="card">
          <div className="card-title">
            <span>02</span>
            <div>
              <h2>회원가입 스키마</h2>
              <p>입력값은 모두 처음에는 문자열입니다.</p>
            </div>
          </div>
          <div className="form">
            {/* 필드마다 의미와 동작이 다르므로 반복문 대신 명시적으로 작성한다. */}
            <fieldset className="form-section">
              <legend>기본 정보</legend>
              <label>
                이메일
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </label>
              <label>
                나이
                <input
                  type="text"
                  value={form.age}
                  onChange={(event) => updateField("age", event.target.value)}
                  placeholder="예: 20"
                />
              </label>
            </fieldset>

            <fieldset className="form-section">
              <legend>보안 정보</legend>
              <label>
                비밀번호
                <span className="password-input">
                  <input
                    type={visiblePasswords.password ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={
                      visiblePasswords.password
                        ? "비밀번호 숨기기"
                        : "비밀번호 보기"
                    }
                    onClick={() =>
                      setVisiblePasswords((current) => ({
                        ...current,
                        password: !current.password,
                      }))
                    }
                  >
                    <EyeIcon closed={!visiblePasswords.password} />
                  </button>
                </span>
              </label>
              <label>
                비밀번호 확인
                <span className="password-input">
                  <input
                    type={
                      visiblePasswords.passwordConfirm ? "text" : "password"
                    }
                    value={form.passwordConfirm}
                    onChange={(event) =>
                      updateField("passwordConfirm", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={
                      visiblePasswords.passwordConfirm
                        ? "비밀번호 확인 숨기기"
                        : "비밀번호 확인 보기"
                    }
                    onClick={() =>
                      setVisiblePasswords((current) => ({
                        ...current,
                        passwordConfirm: !current.passwordConfirm,
                      }))
                    }
                  >
                    <EyeIcon closed={!visiblePasswords.passwordConfirm} />
                  </button>
                </span>
              </label>
            </fieldset>

            <fieldset className="form-section">
              <legend>주소 정보</legend>
              <label>
                도시
                <input
                  type="text"
                  value={form.address.city}
                  onChange={(event) =>
                    updateAddressField("city", event.target.value)
                  }
                  placeholder="예: 서울"
                />
              </label>
              <label>
                우편번호
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.address.zipCode}
                  onChange={(event) =>
                    updateAddressField("zipCode", event.target.value)
                  }
                  placeholder="예: 04524"
                />
              </label>
            </fieldset>
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
    </main>
  );
}

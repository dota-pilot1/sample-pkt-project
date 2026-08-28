"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// 학습 포인트 1: Zod 스키마는 화면의 입력 규칙과 최종 제출 데이터 모양을 한곳에서 정한다.
const signupSchema = z
  .object({
    email: z.email("올바른 이메일을 입력하세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    passwordConfirm: z.string(),
    profile: z.object({
      city: z.string().trim().min(1, "도시를 입력하세요."),
      zipCode: z.string().regex(/^\d{5}$/, "우편번호 5자리를 입력하세요."),
    }),
    skills: z
      .array(z.object({ name: z.string().trim().min(2, "기술 이름을 2자 이상 입력하세요.") }))
      .min(1, "관심 기술을 하나 이상 추가하세요."),
  })
  // 여러 필드의 관계는 field-level 규칙 대신 refine으로 검사하고 오류 위치를 지정한다.
  .refine((values) => values.password === values.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

// 학습 포인트 2: 스키마에서 타입을 추론하면 input 이름·오류 경로·제출 데이터가 같은 구조를 공유한다.
type SignupForm = z.infer<typeof signupSchema>;

const defaultValues: SignupForm = {
  email: "",
  password: "",
  passwordConfirm: "",
  profile: { city: "", zipCode: "" },
  skills: [{ name: "" }],
};

export default function Level2Page() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setError,
  // 학습 포인트 3: useForm은 입력값·오류·제출 상태를 관리하고 zodResolver는 Zod 결과를 errors로 바꾼다.
  } = useForm<SignupForm>({
    defaultValues,
    // 처음에는 필드에서 포커스를 뺄 때 검사하고, 그 뒤에는 입력할 때마다 다시 확인한다.
    mode: "onTouched",
    resolver: zodResolver(signupSchema),
  });
  // 학습 포인트 4: useFieldArray는 사용자가 늘리고 줄이는 입력 행의 안정적인 id와 상태를 관리한다.
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });
  const [submitted, setSubmitted] = useState<SignupForm | null>(null);

  async function submit(values: SignupForm) {
    setSubmitted(null);
    // 실제 API 응답이 특정 이메일을 사용할 수 없다고 알려준 상황을 재현한다.
    if (values.email.toLowerCase().includes("taken")) {
      // 학습 포인트 5: 서버 오류도 setError로 넣으면 Zod 오류와 같은 email 출력 경로를 사용한다.
      setError("email", { type: "server", message: "이미 사용 중인 이메일입니다. 다른 이메일을 입력하세요." });
      return;
    }
    setSubmitted(values);
  }

  function resetPractice() {
    reset(defaultValues);
    setSubmitted(null);
  }

  return (
    <main className="shell">
      <header className="hero compact-hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 2</p>
        <h1>실전 폼 검증</h1>
        <p>React Hook Form의 폼 상태와 Zod 스키마를 연결해 중첩·배열·교차 검증을 다룹니다.</p>
      </header>

      <section className="level-two-grid">
        <article className="form-card">
          <div className="card-title">
            <span>01</span>
            <div>
              <h2>프로필 등록 폼</h2>
              <p>blur 시 Zod 오류를 필드 가까이에 표시하고, 제출 시 서버 오류도 같은 흐름으로 합칩니다.</p>
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit(submit)} noValidate>
            <fieldset className="form-section">
              <legend><span className="lesson-tag">TODO 2</span> 입력할 때 오류 보여주기</legend>
              <p className="section-help">register·zodResolver·formState.errors로 Zod의 검증 결과를 입력 필드와 연결합니다.</p>
              <label>
                이메일
                <input type="email" placeholder="me@example.com" aria-invalid={Boolean(errors.email)} {...register("email")} />
                {errors.email && <span className="field-error">{errors.email.message}</span>}
              </label>
              <div className="form-row">
                <label>
                  비밀번호
                  <input type="password" placeholder="8자 이상" aria-invalid={Boolean(errors.password)} {...register("password")} />
                  {errors.password && <span className="field-error">{errors.password.message}</span>}
                </label>
                <label>
                  비밀번호 확인
                  <input type="password" placeholder="한 번 더 입력" aria-invalid={Boolean(errors.passwordConfirm)} {...register("passwordConfirm")} />
                  {errors.passwordConfirm && <span className="field-error">{errors.passwordConfirm.message}</span>}
                </label>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend><span className="lesson-tag">TODO 3</span> 여러 입력칸과 중복 이메일 오류</legend>
              <p className="section-help">중첩 객체, 기술 배열, 서버가 돌려준 오류를 동일한 오류 모델로 다룹니다.</p>
              <div className="form-row">
                <label>
                  도시
                  <input placeholder="예: 서울" aria-invalid={Boolean(errors.profile?.city)} {...register("profile.city")} />
                  {errors.profile?.city && <span className="field-error">{errors.profile.city.message}</span>}
                </label>
                <label>
                  우편번호
                  <input inputMode="numeric" placeholder="04524" aria-invalid={Boolean(errors.profile?.zipCode)} {...register("profile.zipCode")} />
                  {errors.profile?.zipCode && <span className="field-error">{errors.profile.zipCode.message}</span>}
                </label>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>TODO 3 · 관심 기술 추가하기</legend>
              <p className="section-help">useFieldArray로 입력 행을 추가·삭제하고 각 배열 항목의 오류를 분리합니다.</p>
              <div className="skill-list">
                {fields.map((field, index) => (
                  <div className="skill-row" key={field.id}>
                    <label>
                      기술 {index + 1}
                      <input placeholder="예: React" aria-invalid={Boolean(errors.skills?.[index]?.name)} {...register(`skills.${index}.name`)} />
                      {errors.skills?.[index]?.name && <span className="field-error">{errors.skills[index].name.message}</span>}
                    </label>
                    <button className="secondary-button" type="button" onClick={() => remove(index)} disabled={fields.length === 1}>삭제</button>
                  </div>
                ))}
              </div>
              {errors.skills?.root && <span className="field-error">{errors.skills.root.message}</span>}
              <button className="add-button" type="button" onClick={() => append({ name: "" })}>+ 기술 추가</button>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={resetPractice}>초기화</button>
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? "제출 중..." : "Zod 검증 후 제출"}</button>
            </div>
          </form>
        </article>

        <aside className="level-two-side">
          <section className="flow-card">
            <p className="lesson-label">VALIDATION FLOW</p>
            <ol>
              <li><b>TODO 2 · 입력 연결</b><span>입력 DOM을 React Hook Form 상태에 연결합니다.</span></li>
              <li><b>TODO 2 · 오류 보여주기</b><span>Zod issues를 errors 구조로 변환합니다.</span></li>
              <li><b>TODO 3 · 중복 이메일</b><span>서버 오류도 이메일 필드 오류로 합칩니다.</span></li>
            </ol>
            <p className={`validity ${isValid ? "ready" : ""}`}>{isValid ? "클라이언트 검증 통과" : "필수 항목을 채우면 제출할 수 있습니다."}</p>
          </section>
          <section className="result-panel" aria-live="polite">
            <p className="lesson-label">SUBMISSION RESULT</p>
            <h2>제출 결과</h2>
            {submitted ? <pre>{JSON.stringify(submitted, null, 2)}</pre> : <p>유효한 값을 제출하면 Zod가 보장한 데이터 구조를 확인할 수 있습니다.<br /><br />`taken@example.com`으로 제출하면 서버 오류 매핑도 확인할 수 있습니다.</p>}
          </section>
        </aside>
      </section>
    </main>
  );
}

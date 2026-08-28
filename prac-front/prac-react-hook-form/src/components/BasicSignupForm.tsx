"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type BasicFormValues = {
  username: string;
  email: string;
  password: string;
};

export default function BasicSignupForm() {
  const [submitted, setSubmitted] = useState<BasicFormValues | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BasicFormValues>({
    mode: "onBlur",
  });

  // 실제 API 연결 전, RHF가 제출 상태를 관리하는 흐름만 연습한다.
  async function onSubmit(values: BasicFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(values);
  }

  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">MENU 1 · BASIC FORM</p>
          <h2>회원가입 기본 폼</h2>
          <p>입력 연결과 제출 흐름만 먼저 익힙니다.</p>
        </div>
        <span>RHF</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="field">
          이름
          <input
            {...register("username", { required: "이름을 입력해 주세요." })}
            placeholder="홍길동"
          />
          {errors.username && (
            <small className="field-error">{errors.username.message}</small>
          )}
        </label>

        <label className="field">
          이메일
          <input
            {...register("email", {
              required: "이메일을 입력해 주세요.",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "이메일 형식을 확인해 주세요.",
              },
            })}
            type="email"
            placeholder="user@example.com"
          />
          {errors.email && (
            <small className="field-error">{errors.email.message}</small>
          )}
        </label>

        <label className="field">
          비밀번호
          <input
            {...register("password", {
              required: "비밀번호를 입력해 주세요.",
              minLength: { value: 8, message: "8자 이상 입력해 주세요." },
            })}
            type="password"
            placeholder="8자 이상"
          />
          {errors.password && (
            <small className="field-error">{errors.password.message}</small>
          )}
        </label>

        <button className="primary" disabled={isSubmitting}>
          {isSubmitting ? "제출 중…" : "제출하기"}
        </button>

        {submitted && (
          <p className="success" role="status">
            <strong>제출 성공</strong>
            <br />
            {submitted.username}님의 입력을 받았습니다.
          </p>
        )}
      </form>
    </section>
  );
}

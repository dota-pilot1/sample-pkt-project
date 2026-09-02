"use client";

import { useState } from "react";
import { useLoginMutation } from "@/entities/session/model/useSessionQuery";
import PasswordInput from "@/shared/ui/password-input/PasswordInput";

export default function LoginForm() {
  const loginMutation = useLoginMutation();
  const [username, setUsername] = useState("operator");
  const [password, setPassword] = useState("pkt1234!");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ username, password });
  }

  return (
    <article className="card login-card">
      <p className="lesson-label">AUTHENTICATION</p>
      <h2>세션 로그인</h2>
      <p className="card-description">
        로그인 응답의 토큰은 JavaScript 상태가 아니라 HttpOnly 쿠키에 저장됩니다.
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>아이디</span>
          <input
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <PasswordInput
          id="login-password"
          label="비밀번호"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        {loginMutation.isError ? (
          <p className="form-notice error" role="alert">
            {loginMutation.error.message}
          </p>
        ) : null}

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "세션 생성 중…" : "로그인"}
        </button>
      </form>
    </article>
  );
}

"use client";

import { useState } from "react";
import { useRegisterMutation } from "@/entities/session/model/useSessionQuery";
import PasswordInput from "@/shared/ui/password-input/PasswordInput";

/** 가입 입력을 검증하고 회원 생성과 자동 로그인을 하나의 mutation으로 실행한다. */
export default function RegisterForm() {
  const registerMutation = useRegisterMutation();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== passwordConfirm) {
      setClientError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setClientError(null);
    registerMutation.mutate({ username, displayName, password });
  }

  return (
    <article className="card login-card">
      <p className="lesson-label">REGISTRATION</p>
      <h2>새 계정 만들기</h2>
      <p className="card-description">
        입력 검증과 중복 확인 후 scrypt 해시만 SQLite에 저장하고 즉시 로그인합니다.
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>아이디</span>
          <input
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="예: line_operator"
            minLength={4}
            maxLength={20}
            pattern="[a-z0-9][a-z0-9_-]{3,19}"
            required
          />
          <small>영문 소문자·숫자·_·- 조합 4~20자</small>
        </label>
        <label className="form-field">
          <span>표시 이름</span>
          <input
            name="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
            placeholder="예: 포장 라인 담당자"
            minLength={2}
            maxLength={30}
            required
          />
        </label>
        <PasswordInput
          id="register-password"
          label="비밀번호"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordInput
          id="register-password-confirm"
          label="비밀번호 확인"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          autoComplete="new-password"
        />
        <p className="password-rule">영문과 숫자를 포함한 8~64자</p>

        {clientError || registerMutation.isError ? (
          <p className="form-notice error" role="alert">
            {clientError ?? registerMutation.error?.message}
          </p>
        ) : null}

        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "계정 생성 중…" : "회원가입 후 시작"}
        </button>
      </form>
    </article>
  );
}

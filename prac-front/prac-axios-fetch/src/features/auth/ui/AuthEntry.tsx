"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthMode = "login" | "register";

/** 로그인과 회원가입을 탭으로 전환하고 전체 인증 학습 순서를 함께 설명한다. */
export default function AuthEntry() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <section className="auth-section">
      <div className="auth-mode-switch" role="tablist" aria-label="인증 방식">
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")}>로그인</button>
        <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => setMode("register")}>회원가입</button>
      </div>

      <div className="login-grid">
        {mode === "login" ? <LoginForm /> : <RegisterForm />}

        <aside className="card lesson-card auth-flow-card">
          <p className="lesson-label">LEVEL 1 AUTH FLOW</p>
          <h2>가입부터 세션 복원까지</h2>
          <ol className="topics">
            <li><b>POST /api/auth/register</b><span>입력 검증·중복 확인·scrypt 해시 저장을 처리합니다.</span></li>
            <li><b>HttpOnly Cookie</b><span>가입 또는 로그인 직후 서버 세션을 안전한 쿠키로 발급합니다.</span></li>
            <li><b>GET /api/auth/me</b><span>새로고침해도 SQLite 세션에서 사용자를 복원합니다.</span></li>
            <li><b>DELETE /api/auth/logout</b><span>DB 세션과 브라우저 쿠키를 함께 제거합니다.</span></li>
          </ol>
          <div className="demo-account">
            <span>DEMO ACCOUNT</span>
            <code>operator / pkt1234!</code>
          </div>
        </aside>
      </div>
    </section>
  );
}

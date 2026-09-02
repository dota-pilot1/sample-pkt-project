"use client";

import { useState } from "react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  autoComplete: "current-password" | "new-password";
  onChange: (value: string) => void;
}

/** 비밀번호 마스킹을 유지하면서 사용자가 필요할 때만 내용을 확인하게 하는 공통 입력이다. */
export default function PasswordInput({ id, label, value, autoComplete, onChange }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrap">
        <input
          id={id}
          name={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={isVisible ? `${label} 숨기기` : `${label} 보기`}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.3A10.8 10.8 0 0112 4c5.2 0 8.6 4.3 9.5 6-.4.8-1.4 2.3-2.9 3.6M6.2 6.2C4.4 7.4 3.1 9.2 2.5 10.5 3.4 12.2 6.8 16.5 12 16.5c1 0 1.9-.2 2.8-.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** 네이티브 접근성을 유지하면서 화살표와 포커스 스타일을 통일하는 공통 Select다. */
export default function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <span className="select-control">
      <select className={`select-control-field ${className}`} {...props}>
        {children}
      </select>
      <svg
        className="select-control-chevron"
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="m6.5 8 3.5 3.5L13.5 8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

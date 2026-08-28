import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  children: ReactNode;
};

export default function Select({ children, className, ...props }: SelectProps) {
  return (
    <span className="select-control">
      {/* 학습 포인트: native select의 동작은 유지하고, 화살표만 공통 SVG로 고정한다. */}
      <select className={className} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="select-chevron"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="m4 6 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

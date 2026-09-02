import type { PropsWithChildren } from "react";

interface StatusBadgeProps {
  tone: string;
}

/** 상태 텍스트와 색상 토큰을 함께 표현하는 공통 읽기 전용 배지다. */
export default function StatusBadge({ tone, children }: PropsWithChildren<StatusBadgeProps>) {
  return (
    <span className="status-badge" data-status={tone}>
      <span className="status-badge-dot" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}

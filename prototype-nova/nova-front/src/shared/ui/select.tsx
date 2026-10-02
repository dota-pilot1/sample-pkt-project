import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** 네이티브 선택·키보드 동작을 유지하면서 공통 입력 스타일을 적용한다. */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative block w-full min-w-0">
      <select
        data-slot="select"
        className={cn(
          "h-11 w-full appearance-none rounded-[9px] border border-[var(--line)] bg-[var(--control-surface)] pl-3 pr-10 text-sm text-[var(--ink)] transition outline-none",
          "focus-visible:border-[var(--focus)] focus-visible:ring-[3px] focus-visible:ring-[var(--focus-soft)]",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--error)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
    </span>
  );
}

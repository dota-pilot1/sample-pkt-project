import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 resize-y rounded-[9px] border border-[var(--line)] bg-[var(--control-surface)] px-3 py-3 text-sm text-[var(--ink)] transition outline-none placeholder:text-[var(--muted)]",
        "focus-visible:border-[var(--focus)] focus-visible:ring-[3px] focus-visible:ring-[var(--focus-soft)]",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--error)]",
        className,
      )}
      {...props}
    />
  );
}

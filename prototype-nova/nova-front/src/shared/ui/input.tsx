import * as React from "react"
import { cn } from "@/shared/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[9px] border border-[var(--line)] bg-[var(--control-surface)] px-3 text-sm text-[var(--ink)] shadow-none transition outline-none placeholder:text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-soft)]",
        "aria-invalid:border-[var(--accent-deep)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }

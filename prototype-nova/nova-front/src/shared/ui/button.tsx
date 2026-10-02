import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = {
  default: "bg-[var(--action)] text-white hover:bg-[var(--action-hover)]",
  outline: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--neutral-hover)]",
  ghost: "text-[var(--ink)] hover:bg-[var(--neutral-hover)]",
} as const;

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: React.ComponentProps<"button"> &
  {
    loading?: boolean;
    variant?: keyof typeof buttonVariants;
    size?: "default" | "sm" | "lg" | "icon";
  }) {
  const sizeClassName = { default: "h-11 px-4", sm: "h-9 px-3", lg: "h-12 px-6", icon: "size-11" }[size];
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn("inline-flex shrink-0 items-center justify-center gap-2 rounded-[9px] text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] disabled:pointer-events-none disabled:opacity-50", buttonVariants[variant], sizeClassName, className)}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" />}
      {children}
    </button>
  )
}

export { Button, buttonVariants }

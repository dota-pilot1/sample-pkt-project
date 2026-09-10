import * as React from "react"
import { cn } from "@/shared/lib/utils";

const buttonVariants = {
  default: "bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)]",
  outline: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--accent-soft)]",
  ghost: "text-[var(--ink)] hover:bg-[var(--accent-soft)]",
} as const;

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"button"> &
  {
    variant?: keyof typeof buttonVariants;
    size?: "default" | "sm" | "lg" | "icon";
  }) {
  const sizeClassName = { default: "h-11 px-4", sm: "h-9 px-3", lg: "h-12 px-6", icon: "size-11" }[size];
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn("inline-flex shrink-0 items-center justify-center gap-2 rounded-[9px] text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 disabled:pointer-events-none disabled:opacity-50", buttonVariants[variant], sizeClassName, className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }

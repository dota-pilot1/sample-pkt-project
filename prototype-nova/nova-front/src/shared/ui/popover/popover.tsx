"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";

type PopoverProps = {
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerLabel: string;
};

export function Popover({
  children,
  className,
  panelClassName,
  trigger,
  triggerClassName,
  triggerLabel,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const closeWhenOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeWhenEscaped = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeWhenEscaped);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeWhenEscaped);
    };
  }, [open]);

  return (
    <div className={className} ref={containerRef}>
      <button
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={triggerLabel}
        className={open ? `${triggerClassName} is-open` : triggerClassName}
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        {trigger}
      </button>
      {open && (
        <section
          aria-label={triggerLabel}
          className={panelClassName}
          id={panelId}
        >
          {children}
        </section>
      )}
    </div>
  );
}

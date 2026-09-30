"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type SideDrawerProps = {
  open: boolean;
  ariaLabel: string;
  children: ReactNode;
  onClose: () => void;
  onExited?: () => void;
  size?: "default" | "wide" | "extraWide";
};

const exitDuration = 420;

/** 오른쪽 패널, 바깥 클릭, Escape, 전환 종료 후 언마운트를 공통으로 제공한다. */
export function SideDrawer({
  open,
  ariaLabel,
  children,
  onClose,
  onExited,
  size = "default",
}: SideDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const onExitedRef = useRef(onExited);

  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // 브라우저가 마운트와 상태 변경을 첫 paint에 합치지 않도록 화면 밖 상태를 두 프레임 먼저 그린다.
      let secondFrame = 0;
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        window.cancelAnimationFrame(firstFrame);
        if (secondFrame) window.cancelAnimationFrame(secondFrame);
      };
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setMounted(false);
      onExitedRef.current?.();
    }, exitDuration);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`side-drawer-root ${visible ? "is-visible" : "is-hidden"}`}
      onMouseDown={onClose}
      style={{ transition: "opacity 360ms ease-out" }}
    >
      <aside
        aria-label={ariaLabel}
        aria-modal="true"
        className={`side-drawer-panel ${size === "wide" ? "is-wide" : size === "extraWide" ? "is-extra-wide" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        style={{
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
}

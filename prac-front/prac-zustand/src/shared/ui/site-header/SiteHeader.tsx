"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const levels = [
  { href: "/level-1", label: "레벨 1 · 기본 상태", ready: true },
  { href: "/level-2", label: "레벨 2 · 조합", ready: true },
  { href: "/level-3", label: "레벨 3 · 실전", ready: false },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">Z</span>
          <span>Zustand Practice Lab</span>
        </Link>
        <nav aria-label="학습 레벨">
          {levels.map((level) => (
            <Link
              key={level.href}
              href={level.href}
              className={`nav-link ${pathname === level.href ? "active" : ""} ${!level.ready ? "disabled" : ""}`}
            >
              {level.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

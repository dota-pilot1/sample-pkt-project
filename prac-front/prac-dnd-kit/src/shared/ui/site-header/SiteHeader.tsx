"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const levels = [
  { href: "/level-1", label: "레벨 1 · 드래그와 드롭" },
  { href: "/level-2", label: "레벨 2 · 목록 정렬" },
  { href: "/level-3", label: "레벨 3 · 칸반 보드" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <header
      className={`site-header ${pathname === "/level-2" ? "level-two-header" : ""}`}
    >
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">D</span>
          <span>dnd-kit Practice Lab</span>
        </Link>
        <nav aria-label="학습 레벨">
          {levels.map((level) => (
            <Link
              key={level.href}
              href={level.href}
              className={`nav-link ${pathname === level.href ? "active" : ""}`}
            >
              {level.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

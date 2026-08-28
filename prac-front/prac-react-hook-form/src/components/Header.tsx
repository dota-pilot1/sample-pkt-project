"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { href: "/basic", label: "레벨 1 · 기본 폼" },
  { href: "/validation", label: "레벨 2 · 검증 폼" },
  { href: "/signup", label: "레벨 3 · 저장 폼" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">P</span>
          <span>React Hook Form Lab</span>
        </Link>
        <nav aria-label="주 메뉴">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`nav-link ${pathname === menu.href ? "active" : ""}`}
            >
              {menu.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

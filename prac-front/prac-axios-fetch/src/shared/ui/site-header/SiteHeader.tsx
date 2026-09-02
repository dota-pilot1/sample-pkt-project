"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const levels = [
  { href: "/level-1", label: "레벨 1 · 인증 세션", ready: true },
  { href: "/level-2", label: "레벨 2 · 래퍼와 CRUD", ready: true },
  { href: "/level-3", label: "레벨 3 · Axios CRUD", ready: true },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">HTTP</span>
          <span>Axios & Fetch Practice Lab</span>
        </Link>
        <nav aria-label="학습 레벨">
          {levels.map((level) => (
            <span
              key={level.href}
              className={`nav-link ${pathname.startsWith(level.href) ? "active" : ""} ${!level.ready ? "disabled" : ""}`}
            >
              {level.ready ? <Link href={level.href}>{level.label}</Link> : level.label}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}

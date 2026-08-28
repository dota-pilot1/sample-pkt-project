"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const levels = [
  { href: "/", label: "레벨 1 · 기본 스키마", ready: true },
  { href: "#level-2", label: "레벨 2 · 검증", ready: false },
  { href: "#level-3", label: "레벨 3 · 변환·API", ready: false },
];

export default function Header() {
  const pathname = usePathname();

  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand"><span className="brand-mark">Z</span><span>Zod Practice Lab</span></Link>
    <nav aria-label="학습 레벨">{levels.map((level) => level.ready
      ? <Link key={level.href} href={level.href} className={`nav-link ${pathname === level.href ? "active" : ""}`}>{level.label}</Link>
      : <span key={level.href} className="nav-link disabled" aria-disabled="true">{level.label}</span>)}</nav>
  </div></header>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, PackageOpen, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect } from "react";
import { AuthGate } from "@/features/auth/login/ui/auth-gate";
import { useAuthStore } from "@/features/auth/login/model/auth-store";
import { ConsoleHeaderActions } from "@/widgets/console-header/ui/console-header-actions";

type AdminSection = "plans" | "users" | "roles" | "permissions";
const navigation = [
  { id: "plans", href: "/admin", label: "상품·요금제", Icon: PackageOpen },
  { id: "users", href: "/admin/users", label: "유저 관리", Icon: UsersRound },
  { id: "permissions", href: "/permissions", label: "권한 관리", Icon: ShieldCheck },
  { id: "roles", href: "/roles", label: "역할 관리", Icon: KeyRound },
] as const;

/** 관리자 메뉴와 상단 도구를 한 곳에서 제공해 각 관리 화면의 구조를 같게 유지한다. */
export function AdminShell({ activeSection, title, children }: Readonly<{ activeSection: AdminSection; title: string; children: React.ReactNode }>) {
  return <AuthGate><AdminShellContent activeSection={activeSection} title={title}>{children}</AdminShellContent></AuthGate>;
}

function AdminShellContent({ activeSection, title, children }: Readonly<{ activeSection: AdminSection; title: string; children: React.ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  useEffect(() => { if (user && !user.roleCodes.includes("SYSTEM_ADMIN")) router.replace("/"); }, [router, user]);

  // 권한 없는 사용자는 관리자 화면 내용이 잠깐이라도 보이지 않게 한다.
  if (!user?.roleCodes.includes("SYSTEM_ADMIN")) return <main className="min-h-screen bg-[var(--soft)]" aria-busy="true" />;

  return <div className="nova-shell"><a className="skip-link" href="#admin-content">본문으로 바로가기</a><aside className="sidebar"><div className="brand"><span>N</span><div><strong>NOVA</strong><small>BSS CONSOLE</small></div></div><nav aria-label="관리자 메뉴">{navigation.map(({ id, href, label, Icon }) => <Link key={id} aria-current={id === activeSection ? "page" : undefined} aria-label={label} className={`nav-item${id === activeSection ? " active" : ""}`} href={href}><Icon aria-hidden="true" size={18} /><span className="nav-label">{label}</span></Link>)}</nav><div className="sidebar-bottom"><p>Prototype v0.1</p></div></aside><div className="content"><header className="topbar"><div className="header-title"><p>BSS CONSOLE · ADMIN</p><strong>{title}</strong></div><ConsoleHeaderActions /></header><main className="page-body" id="admin-content" tabIndex={-1}>{children}</main></div></div>;
}

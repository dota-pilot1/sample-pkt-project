"use client";

import { PackageOpen } from "lucide-react";
import { AuthGate } from "@/features/auth/login/ui/auth-gate";
import { PlanManagement } from "@/widgets/plan-management/ui/plan-management";
import { ConsoleHeaderActions } from "@/widgets/console-header/ui/console-header-actions";

export default function NovaHomePage() {
  return <AuthGate><div className="nova-shell"><a className="skip-link" href="#plan-management">본문으로 바로가기</a><aside className="sidebar"><div className="brand"><span>N</span><div><strong>NOVA</strong><small>BSS CONSOLE</small></div></div><nav aria-label="주 메뉴"><span className="nav-item active"><PackageOpen aria-hidden="true" size={18} /><span className="nav-label">상품·요금제</span></span></nav><div className="sidebar-bottom"><p>Prototype v0.1</p></div></aside><div className="content"><header className="topbar"><div className="header-title"><p>BSS CONSOLE</p><strong>상품·요금제</strong></div><ConsoleHeaderActions /></header><main className="page-body" id="plan-management" tabIndex={-1}><div className="page-heading"><h1>상품·요금제 관리</h1><p>요금제의 기본 정보와 판매 상태를 관리합니다.</p></div><PlanManagement /></main></div></div></AuthGate>;
}

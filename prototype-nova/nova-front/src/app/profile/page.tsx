"use client";

import Link from "next/link";
import { PackageOpen, ShieldCheck, UserRound } from "lucide-react";
import { AppearanceMenu, type Language } from "@/features/appearance-settings/ui/appearance-menu";
import { AuthGate } from "@/features/auth/login/ui/auth-gate";
import { UserMenu } from "@/features/auth/login/ui/user-menu";
import { ProfileContent } from "@/features/profile/ui/profile-content";
import { useProfile } from "@/features/profile/model/use-profile";
import { useAuthStore } from "@/features/auth/login/model/auth-store";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [language, setLanguage] = useState<Language>("ko");

  useEffect(() => {
    const stored = window.localStorage.getItem("nova-language");
    if (stored === "ko" || stored === "en") setLanguage(stored);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("nova-language", language);
  }, [language]);

  return (
    <AuthGate>
      <ProfilePageBody language={language} onLanguageChange={setLanguage} />
    </AuthGate>
  );
}

function ProfilePageBody({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const profile = useProfile(user?.id);

  if (!user) return null;

  return (
      <div className="nova-shell">
        <a className="skip-link" href="#profile-content">본문으로 바로가기</a>
        <aside className="sidebar">
          <div className="brand"><span>N</span><div><strong>NOVA</strong><small>BSS CONSOLE</small></div></div>
          <nav aria-label="주 메뉴">
            <Link aria-label="상품·요금제" className="nav-item" href="/"><PackageOpen aria-hidden="true" size={18} /><span className="nav-label">상품·요금제</span></Link>
            <Link aria-label="권한 관리" className="nav-item" href="/permissions"><ShieldCheck aria-hidden="true" size={18} /><span className="nav-label">권한 관리</span></Link>
            <Link aria-current="page" aria-label="내 프로필" className="nav-item active" href="/profile"><UserRound aria-hidden="true" size={18} /><span className="nav-label">내 프로필</span></Link>
          </nav>
          <div className="sidebar-bottom"><p>Prototype v0.1</p></div>
        </aside>
        <div className="content">
          <header className="topbar"><div className="header-title"><p>BSS CONSOLE</p><strong>내 프로필</strong></div><div className="top-actions"><UserMenu /><AppearanceMenu language={language} onLanguageChange={onLanguageChange} /></div></header>
          <main className="page-body" id="profile-content" tabIndex={-1}>
            <div className="page-heading"><h1>내 프로필</h1><p>계정 정보와 현재 역할에 따라 적용되는 개인 권한을 확인합니다.</p></div>
            {profile.isPending ? (
              <div className="flex min-h-[260px] items-center justify-center gap-2.5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] font-bold text-[var(--muted)]" aria-busy="true">
                프로필을 불러오는 중입니다.
              </div>
            ) : profile.isError || !profile.data ? (
              <div className="flex min-h-[260px] items-center justify-center gap-2.5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] font-bold text-[var(--accent-deep)]" role="alert">
                프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
              </div>
            ) : (
              <ProfileContent profile={profile.data} />
            )}
          </main>
        </div>
      </div>
  );
}

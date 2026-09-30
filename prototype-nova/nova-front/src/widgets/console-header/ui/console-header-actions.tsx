"use client";

import { useEffect, useState } from "react";
import { AdminLink } from "@/features/admin/ui/admin-link";
import { AppearanceMenu, type Language } from "@/features/appearance-settings/ui/appearance-menu";
import { UserMenu } from "@/features/auth/login/ui/user-menu";

/** 모든 콘솔 화면의 우상단 버튼을 같은 순서와 동작으로 보여 준다. */
export function ConsoleHeaderActions() {
  const [language, setLanguage] = useState<Language>("ko");

  useEffect(() => {
    const stored = window.localStorage.getItem("nova-language");
    if (stored === "ko" || stored === "en") setLanguage(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("nova-language", language);
  }, [language]);

  return <div className="top-actions"><AdminLink /><UserMenu /><AppearanceMenu language={language} onLanguageChange={setLanguage} /></div>;
}

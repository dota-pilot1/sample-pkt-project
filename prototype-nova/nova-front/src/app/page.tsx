"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import {
  AppearanceMenu,
  type Language,
} from "@/features/appearance-settings/ui/appearance-menu";

const copy = {
  ko: {
    navigation: "주 메뉴",
    skipToContent: "본문으로 바로가기",
    workspace: "BSS CONSOLE",
    title: "상품·요금제 관리",
    menu: "상품·요금제",
    description: "요금제의 기본 정보와 판매 상태를 관리합니다.",
    listTitle: "요금제 목록",
    preparing: "준비 중",
    columns: ["요금제 코드", "요금제명", "분류", "월 기본료", "판매 상태", "수정일"],
    emptyTitle: "요금제 관리 기능을 준비하고 있습니다.",
    emptyDescription: "등록·조회 기능이 제공되면 이곳에서 요금제를 관리할 수 있습니다.",
  },
  en: {
    navigation: "Main navigation",
    skipToContent: "Skip to content",
    workspace: "BSS CONSOLE",
    title: "Product & plan management",
    menu: "Products & plans",
    description: "Manage plan information and sales status.",
    listTitle: "Plans",
    preparing: "Coming soon",
    columns: ["Plan code", "Plan name", "Category", "Monthly fee", "Sales status", "Updated"],
    emptyTitle: "Plan management is being prepared.",
    emptyDescription: "You will be able to manage plans here once registration and browsing are available.",
  },
} as const;

export default function NovaHomePage() {
  const [language, setLanguage] = useState<Language>("ko");
  const text = copy[language];

  useEffect(() => {
    const stored = window.localStorage.getItem("nova-language");
    if (stored === "ko" || stored === "en") setLanguage(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("nova-language", language);
  }, [language]);

  return (
    <div className="nova-shell">
      <a className="skip-link" href="#plan-management">
        {text.skipToContent}
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span>N</span>
          <div>
            <strong>NOVA</strong>
            <small>BSS CONSOLE</small>
          </div>
        </div>
        <nav aria-label={text.navigation}>
          <Link
            aria-current="page"
            aria-label={text.menu}
            className="nav-item active"
            href="/"
          >
            <PackageOpen aria-hidden="true" size={18} />
            <span className="nav-label">{text.menu}</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <p>Prototype v0.1</p>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <div className="header-title">
            <p>{text.workspace}</p>
            <strong>{text.menu}</strong>
          </div>
          <div className="top-actions">
            <AppearanceMenu
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </header>
        <main className="page-body" id="plan-management" tabIndex={-1}>
          <div className="page-heading">
            <h1>{text.title}</h1>
            <p>{text.description}</p>
          </div>
          <section className="plan-list" aria-labelledby="plan-list-title">
            <div className="plan-list-header">
              <h2 id="plan-list-title">{text.listTitle}</h2>
              <span className="preparation-badge">{text.preparing}</span>
            </div>
            <div
              className="plan-table-scroll"
              role="region"
              aria-label={text.listTitle}
              tabIndex={0}
            >
              <table className="plan-table">
                <thead>
                  <tr>
                    {text.columns.map((column) => (
                      <th key={column} scope="col">{column}</th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
            <div className="plan-empty">
              <span className="plan-empty-icon">
                <PackageOpen aria-hidden="true" size={30} />
              </span>
              <h3>{text.emptyTitle}</h3>
              <p>{text.emptyDescription}</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

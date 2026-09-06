"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Globe2,
  Moon,
  Minus,
  Palette,
  Plus,
  Sun,
  Type,
} from "lucide-react";

import { Popover } from "@/shared/ui/popover/popover";

export type Language = "ko" | "en";
type Theme = "light" | "dark";
type FontScale = "sm" | "md" | "lg";
type FontFamily = "sans" | "serif" | "mono";

const labels = {
  ko: {
    appearance: "화면 설정",
    language: "언어",
    theme: "테마",
    fontSize: "글자 크기",
    fontFamily: "글씨체",
    light: "라이트",
    dark: "다크",
  },
  en: {
    appearance: "Display settings",
    language: "Language",
    theme: "Theme",
    fontSize: "Text size",
    fontFamily: "Typeface",
    light: "Light",
    dark: "Dark",
  },
} as const;

export function AppearanceMenu({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [fontScale, setFontScale] = useState<FontScale>("md");
  const [fontFamily, setFontFamily] = useState<FontFamily>("sans");
  const text = labels[language];
  const scales: FontScale[] = ["sm", "md", "lg"];
  const scaleIndex = scales.indexOf(fontScale);

  useEffect(() => {
    const saved = window.localStorage;
    setTheme((saved.getItem("nova-theme") as Theme) || "light");
    setFontScale((saved.getItem("nova-font-scale") as FontScale) || "md");
    setFontFamily((saved.getItem("nova-font-family") as FontFamily) || "sans");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.novaTheme = theme;
    root.dataset.fontScale = fontScale;
    root.dataset.fontFamily = fontFamily;
    window.localStorage.setItem("nova-theme", theme);
    window.localStorage.setItem("nova-font-scale", fontScale);
    window.localStorage.setItem("nova-font-family", fontFamily);
  }, [fontFamily, fontScale, theme]);

  return (
    <Popover
      className="appearance"
      panelClassName="appearance-panel"
      trigger={
        <>
          <Palette size={17} />
          <span>{text.appearance}</span>
          <ChevronDown size={15} />
        </>
      }
      triggerClassName="appearance-trigger"
      triggerLabel={text.appearance}
    >
      <div className="appearance-section">
        <p>
          <Globe2 size={14} />
          {text.language}
        </p>
        <div className="setting-grid two-columns">
          {(["ko", "en"] as Language[]).map((item) => (
            <button
              aria-pressed={language === item}
              className={
                language === item ? "setting-choice selected" : "setting-choice"
              }
              key={item}
              onClick={() => onLanguageChange(item)}
              type="button"
            >
              {item === "ko" ? "한국어" : "English"}
              {language === item && <Check size={13} />}
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-section">
        <p>
          <Sun size={14} />
          {text.theme}
        </p>
        <div className="setting-grid two-columns">
          <button
            aria-pressed={theme === "light"}
            className={
              theme === "light" ? "setting-choice selected" : "setting-choice"
            }
            onClick={() => setTheme("light")}
            type="button"
          >
            <Sun size={14} />
            {text.light}
          </button>
          <button
            aria-pressed={theme === "dark"}
            className={
              theme === "dark" ? "setting-choice selected" : "setting-choice"
            }
            onClick={() => setTheme("dark")}
            type="button"
          >
            <Moon size={14} />
            {text.dark}
          </button>
        </div>
      </div>
      <div className="appearance-section compact-section">
        <p>
          <Type size={14} />
          {text.fontSize}
        </p>
        <div className="font-stepper">
          <button
            aria-label="Decrease text size"
            disabled={scaleIndex === 0}
            onClick={() => setFontScale(scales[scaleIndex - 1])}
            type="button"
          >
            <Minus size={16} />
          </button>
          <output>{fontScale.toUpperCase()}</output>
          <button
            aria-label="Increase text size"
            disabled={scaleIndex === scales.length - 1}
            onClick={() => setFontScale(scales[scaleIndex + 1])}
            type="button"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="appearance-section compact-section">
        <p>
          <Type size={14} />
          {text.fontFamily}
        </p>
        <div className="setting-grid three-columns">
          {(["sans", "serif", "mono"] as FontFamily[]).map((item) => (
            <button
              aria-pressed={fontFamily === item}
              className={
                fontFamily === item ? "font-choice selected" : "font-choice"
              }
              key={item}
              onClick={() => setFontFamily(item)}
              type="button"
            >
              {item === "sans" ? "Aa" : item === "serif" ? "가" : "01"}
            </button>
          ))}
        </div>
      </div>
    </Popover>
  );
}
